import { reply, react, getUptime } from '../../lib/utils.js';
import { config } from '../../config/config.js';

export const coreCommands = {

  // ─── .menu ───────────────────────────────────────────────
  menu: async (sock, msg, args) => {
    const { buildMenu } = await import('../../lib/utils.js');
    const menuText = buildMenu(sock.user.id);
    await sock.sendMessage(msg.key.remoteJid, {
      text: menuText,
      mentions: [msg.key.participant || msg.key.remoteJid],
    }, { quoted: msg });
  },

  // ─── .alive ──────────────────────────────────────────────
  alive: async (sock, msg) => {
    const uptime = getUptime();
    const text = `╔══════════════════════╗
║   CHICANO MD - ALIVE  
╠══════════════════════╣
║ 🤖 Bot    : ${config.botName}
║ ✅ Status  : En ligne
║ ⏱ Uptime : ${uptime}
║ 🧬 Version: ${config.version}
╚══════════════════════╝`;
    await react(sock, msg, '✅');
    await reply(sock, msg, text);
  },

  // ─── .ping ───────────────────────────────────────────────
  ping: async (sock, msg) => {
    const start = Date.now();
    const sent = await reply(sock, msg, '🏓 Pong...');
    const latency = Date.now() - start;
    await sock.sendMessage(msg.key.remoteJid, {
      text: `🏓 *Pong !*\n⚡ Latence : *${latency}ms*`,
    }, { quoted: msg });
  },

  // ─── .speed ──────────────────────────────────────────────
  speed: async (sock, msg) => {
    const start = Date.now();
    await reply(sock, msg, '⚡ Test de vitesse en cours...');
    const speed = Date.now() - start;
    const uptime = getUptime();
    await reply(sock, msg,
      `⚡ *SPEED TEST*\n\n` +
      `🚀 Vitesse : *${speed}ms*\n` +
      `📶 Statut  : *${speed < 200 ? 'Excellent ✅' : speed < 500 ? 'Bon 🟡' : 'Lent 🔴'}*\n` +
      `⏱ Uptime  : *${uptime}*`
    );
  },

  // ─── .repo ───────────────────────────────────────────────
  repo: async (sock, msg) => {
    await reply(sock, msg,
      `📁 *CHICANO MD - Dépôt GitHub*\n\n` +
      `🔗 ${config.repoUrl}\n\n` +
      `⭐ Donne une étoile si tu aimes le bot !`
    );
  },

  // ─── .script ─────────────────────────────────────────────
  script: async (sock, msg) => {
    await reply(sock, msg,
      `📜 *CHICANO MD SCRIPT*\n\n` +
      `👑 Auteur  : ${config.ownerName}\n` +
      `🧬 Version : ${config.version}\n` +
      `🔗 Repo    : ${config.repoUrl}\n\n` +
      `_Ce bot est open-source. Fork et personnalise-le !_`
    );
  },
};
      
