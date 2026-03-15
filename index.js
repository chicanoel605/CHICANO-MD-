import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import chalk from 'chalk';
import figlet from 'figlet';
import { config } from './config/config.js';
import { messageHandler } from './lib/handler.js';
import readline from 'readline';

// ─── Banner ──────────────────────────────────────────────
console.log(chalk.cyan(figlet.textSync('CHICANO MD', { font: 'Big' })));
console.log(chalk.yellow(`  Version: ${config.version} | Owner: ${config.ownerName}\n`));

// ─── Demander le numéro dans le terminal ─────────────────
function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionId}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // ← Désactive le QR
    browser: Browsers.ubuntu('Chrome'),
    auth: state,
    getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    },
  });

  store.bind(sock.ev);

  // ─── Pair Code ────────────────────────────────────────
  if (!sock.authState.creds.registered) {
    // Demande le numéro si pas encore connecté
    let phoneNumber = config.ownerNumber;

    if (!phoneNumber || phoneNumber === '2250000000000') {
      phoneNumber = await question(chalk.yellow('📱 Entre ton numéro WhatsApp (ex: 2250100000000) : '));
    }

    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        const formatted = code.match(/.{1,4}/g)?.join('-') || code;
        console.log(chalk.green('\n┌─────────────────────────┐'));
        console.log(chalk.green(`│  CODE : ${chalk.bold.white(formatted)}       │`));
        console.log(chalk.green('└─────────────────────────┘'));
        console.log(chalk.yellow('👆 Entre ce code dans WhatsApp > Appareils liés > Lier avec numéro\n'));
      } catch (e) {
        console.error(chalk.red('[PAIR ERROR]'), e.message);
      }
    }, 3000);
  }

  // ─── Gestion connexion ────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode
        : undefined;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red(`\n[DISCONNECT] Code: ${statusCode}`));
      if (shouldReconnect) {
        console.log(chalk.yellow('[RECONNECT] Reconnexion dans 3s...'));
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log(chalk.red('[LOGOUT] Supprime le dossier session et relance.'));
      }
    }

    if (connection === 'open') {
      console.log(chalk.green(`\n[✅ CONNECTÉ] ${config.botName} est en ligne !`));
      console.log(chalk.green(`[BOT] Numéro : ${sock.user?.id}`));
      console.log(chalk.cyan(`[BOT] Préfixe : ${config.prefix}\n`));
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (config.autoRead) await sock.readMessages([msg.key]);
      await messageHandler(sock, msg);
    }
  });
}

connectToWhatsApp().catch(err => {
  console.error(chalk.red('[FATAL ERROR]'), err);
  process.exit(1);
});      
