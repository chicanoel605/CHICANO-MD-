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

// ─── Banner ──────────────────────────────────────────────
console.log(chalk.cyan(figlet.textSync('CHICANO MD', { font: 'Big' })));
console.log(chalk.yellow(`  Version: ${config.version} | Owner: ${config.ownerName}\n`));

// ─── Store (cache en mémoire) ─────────────────────────────
const store = makeInMemoryStore({
  logger: pino({ level: 'silent' }),
});

// ─── Connexion principale ─────────────────────────────────
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionId}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: Browsers.ubuntu('Chrome'),
    auth: state,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return undefined;
    },
  });

  store.bind(sock.ev);

  // ─── Gestion connexion ─────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log(chalk.yellow('\n[QR] Scanne le QR code avec WhatsApp !\n'));
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode
        : undefined;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(chalk.red(`\n[DISCONNECT] Déconnecté. Code: ${statusCode}`));

      if (shouldReconnect) {
        console.log(chalk.yellow('[RECONNECT] Reconnexion en cours...'));
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log(chalk.red('[LOGOUT] Session expirée. Supprime le dossier session et relance.'));
      }
    }

    if (connection === 'open') {
      console.log(chalk.green(`\n[✅ CONNECTED] ${config.botName} est maintenant en ligne !`));
      console.log(chalk.green(`[BOT] Numéro : ${sock.user?.id}`));
      console.log(chalk.cyan(`[BOT] Préfixe : ${config.prefix}`));
      console.log(chalk.cyan(`[BOT] Owner  : ${config.ownerName} (${config.ownerNumber})\n`));
    }
  });

  // ─── Sauvegarde credentials ────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ─── Auto read ─────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      // Auto read
      if (config.autoRead) {
        await sock.readMessages([msg.key]);
      }

      // Handle commandes
      await messageHandler(sock, msg);
    }
  });

  return sock;
}

// ─── Démarrage ───────────────────────────────────────────
connectToWhatsApp().catch(err => {
  console.error(chalk.red('[FATAL ERROR]'), err);
  process.exit(1);
});
