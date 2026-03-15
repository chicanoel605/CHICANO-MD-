import { config } from '../config/config.js';
import { coreCommands } from '../commands/core/index.js';
import { downloadCommands } from '../commands/download/index.js';
import { aiCommands } from '../commands/ai/index.js';
import { groupCommands } from '../commands/group/index.js';
import { ownerCommands } from '../commands/owner/index.js';
import { utilityCommands } from '../commands/utility/index.js';

// ─── Registre de toutes les commandes ────────────────────
const commands = {
  ...coreCommands,
  ...downloadCommands,
  ...aiCommands,
  ...groupCommands,
  ...ownerCommands,
  ...utilityCommands,
};

// ─── Extraire le texte du message ────────────────────────
function getMessageText(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  );
}

// ─── Handler principal ───────────────────────────────────
export async function messageHandler(sock, msg) {
  try {
    if (!msg.message) return;
    if (msg.key.fromMe) return; // Ignore les messages du bot

    const text = getMessageText(msg).trim();
    if (!text.startsWith(config.prefix)) return;

    const body = text.slice(config.prefix.length).trim();
    const [cmd, ...args] = body.split(' ');
    const command = cmd.toLowerCase();

    if (!commands[command]) return;

    // Log
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    console.log(`\n[CMD] ${config.prefix}${command} | From: ${sender} | Chat: ${from}`);

    // Exécution
    await commands[command](sock, msg, args);

  } catch (err) {
    console.error('[HANDLER ERROR]', err);
  }
}
