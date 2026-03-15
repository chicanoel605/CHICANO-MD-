import { config } from '../config/config.js';

// ─── Uptime ───────────────────────────────────────────────
const startTime = Date.now();

export function getUptime() {
  const diff = Date.now() - startTime;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

// ─── JID helpers ─────────────────────────────────────────
export const toJid = (number) =>
  number.includes('@') ? number : `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

export const isOwner = (jid) =>
  jid.replace(/[^0-9]/g, '') === config.ownerNumber.replace(/[^0-9]/g, '');

export const isGroup = (jid) => jid.endsWith('@g.us');

// ─── Message helpers ──────────────────────────────────────
export async function reply(sock, msg, text) {
  return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

export async function react(sock, msg, emoji) {
  return sock.sendMessage(msg.key.remoteJid, {
    react: { text: emoji, key: msg.key },
  });
}

export async function sendTyping(sock, jid) {
  if (config.autoTyping) {
    await sock.sendPresenceUpdate('composing', jid);
    await new Promise(r => setTimeout(r, 1000));
    await sock.sendPresenceUpdate('paused', jid);
  }
}

// ─── Text ─────────────────────────────────────────────────
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Menu builder ─────────────────────────────────────────
export function buildMenu(botJid) {
  const uptime = getUptime();
  return `╔══════════════════════╗
║      CHICANO MD      
╠══════════════════════╣
║ 👤 User    : @user
║ 🤖 Bot     : ${config.botName}
║ 👑 Owner   : ${config.ownerName}
║ 🧬 Version : ${config.version}
║ ⏱ Uptime  : ${uptime}
╚══════════════════════╝

┏━〔 📦 DOWNLOAD SYSTEM 〕━┓
┃ ◈ ${config.prefix}play
┃ ◈ ${config.prefix}video
┃ ◈ ${config.prefix}facebook
┃ ◈ ${config.prefix}ig
┃ ◈ ${config.prefix}tt
┃ ◈ ${config.prefix}pinterest
┃ ◈ ${config.prefix}yts
┃ ◈ ${config.prefix}tourl
┗━━━━━━━━━━━━━━━━━┛

┏━〔 🧠 AI ENGINE 〕━┓
┃ ◈ ${config.prefix}ai
┃ ◈ ${config.prefix}image
┃ ◈ ${config.prefix}lyrics
┗━━━━━━━━━━━━━━━━━┛

┏━〔 👥 GROUP CONTROL 〕━┓
┃ ◈ ${config.prefix}tagall
┃ ◈ ${config.prefix}hidetag
┃ ◈ ${config.prefix}join
┃ ◈ ${config.prefix}leave
┃ ◈ ${config.prefix}gstatus
┃ ◈ ${config.prefix}kick
┃ ◈ ${config.prefix}add
┃ ◈ ${config.prefix}promote
┃ ◈ ${config.prefix}demote
┃ ◈ ${config.prefix}close
┃ ◈ ${config.prefix}open
┃ ◈ ${config.prefix}grouplink
┃ ◈ ${config.prefix}revoke
┃ ◈ ${config.prefix}setname
┃ ◈ ${config.prefix}setdesc
┃ ◈ ${config.prefix}ginfo
┗━━━━━━━━━━━━━━━━━┛

┏━〔 👑 OWNER ACCESS 〕━┓
┃ ◈ ${config.prefix}owner
┃ ◈ ${config.prefix}fullpp
┃ ◈ ${config.prefix}getpp
┗━━━━━━━━━━━━━━━━━┛

┏━〔 ⚡ BOT CORE 〕━┓
┃ ◈ ${config.prefix}alive
┃ ◈ ${config.prefix}ping
┃ ◈ ${config.prefix}speed
┃ ◈ ${config.prefix}menu
┃ ◈ ${config.prefix}repo
┃ ◈ ${config.prefix}script
┗━━━━━━━━━━━━━━━━━┛

┏━〔 🛠 UTILITY TOOLS 〕━┓
┃ ◈ ${config.prefix}rvo
┃ ◈ ${config.prefix}save
┃ ◈ ${config.prefix}pair
┃ ◈ ${config.prefix}weather
┗━━━━━━━━━━━━━━━━━┛

╔═════════════════════╗
║ Prefix : ${config.prefix}
║ System Status : ONLINE ✅
╚═════════════════════╝`;
    }
                                                            
