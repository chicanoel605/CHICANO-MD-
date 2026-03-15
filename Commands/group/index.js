import { reply, react, isOwner } from '../../lib/utils.js';

// Vérifie si l'expéditeur est admin du groupe
async function isAdmin(sock, jid, participant) {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants
      .filter(p => p.admin)
      .some(p => p.id === participant);
  } catch {
    return false;
  }
}

export const groupCommands = {

  // ─── .tagall ─────────────────────────────────────────────
  tagall: async (sock, msg, args) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Commande réservée aux groupes.');
    const meta = await sock.groupMetadata(msg.key.remoteJid);
    const members = meta.participants.map(p => p.id);
    const message = args.join(' ') || '👋 Tout le monde est tagué !';
    const mentions = members;
    let text = `📢 *${message}*\n\n`;
    members.forEach(m => { text += `• @${m.split('@')[0]}\n`; });
    await sock.sendMessage(msg.key.remoteJid, { text, mentions });
  },

  // ─── .hidetag ────────────────────────────────────────────
  hidetag: async (sock, msg, args) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Commande réservée aux groupes.');
    const meta = await sock.groupMetadata(msg.key.remoteJid);
    const members = meta.participants.map(p => p.id);
    const message = args.join(' ') || '📢 Message caché';
    await sock.sendMessage(msg.key.remoteJid, {
      text: message,
      mentions: members,
    });
  },

  // ─── .join ───────────────────────────────────────────────
  join: async (sock, msg, args) => {
    if (!isOwner(msg.key.participant || msg.key.remoteJid))
      return reply(sock, msg, '❌ Réservé au propriétaire.');
    if (!args.length) return reply(sock, msg, `❌ Usage : *.join* <lien du groupe>`);
    try {
      const link = args[0].split('https://chat.whatsapp.com/')[1];
      await sock.groupAcceptInvite(link);
      await react(sock, msg, '✅');
      await reply(sock, msg, '✅ Bot a rejoint le groupe !');
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .leave ──────────────────────────────────────────────
  leave: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!isOwner(msg.key.participant || msg.key.remoteJid))
      return reply(sock, msg, '❌ Réservé au propriétaire.');
    await reply(sock, msg, '👋 Au revoir ! Le bot quitte ce groupe.');
    await sock.groupLeave(msg.key.remoteJid);
  },

  // ─── .gstatus ────────────────────────────────────────────
  gstatus: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    try {
      const meta = await sock.groupMetadata(msg.key.remoteJid);
      const admins = meta.participants.filter(p => p.admin).length;
      await reply(sock, msg,
        `📊 *STATUT DU GROUPE*\n\n` +
        `📛 Nom       : ${meta.subject}\n` +
        `👥 Membres   : ${meta.participants.length}\n` +
        `👑 Admins    : ${admins}\n` +
        `🔒 Mode      : ${meta.restrict ? 'Fermé 🔴' : 'Ouvert 🟢'}\n` +
        `📝 Desc only : ${meta.announce ? 'Oui' : 'Non'}`
      );
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .kick ───────────────────────────────────────────────
  kick: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');
    if (!await isAdmin(sock, msg.key.remoteJid, sender) && !isOwner(sender))
      return reply(sock, msg, '❌ Tu dois être admin pour kick.');

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned?.length) return reply(sock, msg, `❌ Usage : *.kick* @membre`);

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'remove');
    await react(sock, msg, '✅');
    await reply(sock, msg, `✅ ${mentioned.length} membre(s) expulsé(s).`);
  },

  // ─── .add ────────────────────────────────────────────────
  add: async (sock, msg, args) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!args.length) return reply(sock, msg, `❌ Usage : *.add* <numéro>`);
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');

    const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    try {
      await sock.groupParticipantsUpdate(msg.key.remoteJid, [number], 'add');
      await react(sock, msg, '✅');
      await reply(sock, msg, `✅ *${args[0]}* ajouté au groupe !`);
    } catch (e) {
      await reply(sock, msg, `❌ Impossible d'ajouter : ${e.message}`);
    }
  },

  // ─── .promote ────────────────────────────────────────────
  promote: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned?.length) return reply(sock, msg, `❌ Usage : *.promote* @membre`);

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'promote');
    await react(sock, msg, '👑');
    await reply(sock, msg, `👑 Promu(s) admin avec succès !`);
  },

  // ─── .demote ─────────────────────────────────────────────
  demote: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned?.length) return reply(sock, msg, `❌ Usage : *.demote* @membre`);

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'demote');
    await react(sock, msg, '✅');
    await reply(sock, msg, `✅ Admin(s) rétrogradé(s).`);
  },

  // ─── .close ──────────────────────────────────────────────
  close: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');
    await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement');
    await react(sock, msg, '🔒');
    await reply(sock, msg, '🔒 Groupe fermé ! Seuls les admins peuvent écrire.');
  },

  // ─── .open ───────────────────────────────────────────────
  open: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');
    await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
    await react(sock, msg, '🔓');
    await reply(sock, msg, '🔓 Groupe ouvert ! Tout le monde peut écrire.');
  },

  // ─── .grouplink ──────────────────────────────────────────
  grouplink: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    try {
      const code = await sock.groupInviteCode(msg.key.remoteJid);
      await reply(sock, msg,
        `🔗 *Lien d'invitation du groupe*\n\nhttps://chat.whatsapp.com/${code}`
      );
    } catch (e) {
      await reply(sock, msg, '❌ Le bot doit être admin pour obtenir le lien.');
    }
  },

  // ─── .revoke ─────────────────────────────────────────────
  revoke: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');
    try {
      const newCode = await sock.groupRevokeInvite(msg.key.remoteJid);
      await react(sock, msg, '✅');
      await reply(sock, msg,
        `✅ *Lien révoqué !*\n🔗 Nouveau lien :\nhttps://chat.whatsapp.com/${newCode}`
      );
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .setname ────────────────────────────────────────────
  setname: async (sock, msg, args) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!args.length) return reply(sock, msg, `❌ Usage : *.setname* <nouveau nom>`);
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');
    await sock.groupUpdateSubject(msg.key.remoteJid, args.join(' '));
    await react(sock, msg, '✅');
    await reply(sock, msg, `✅ Nom du groupe changé en : *${args.join(' ')}*`);
  },

  // ─── .setdesc ────────────────────────────────────────────
  setdesc: async (sock, msg, args) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    if (!args.length) return reply(sock, msg, `❌ Usage : *.setdesc* <nouvelle description>`);
    if (!await isAdmin(sock, msg.key.remoteJid, sock.user.id))
      return reply(sock, msg, '❌ Le bot doit être admin.');
    await sock.groupUpdateDescription(msg.key.remoteJid, args.join(' '));
    await react(sock, msg, '✅');
    await reply(sock, msg, `✅ Description du groupe mise à jour !`);
  },

  // ─── .ginfo ──────────────────────────────────────────────
  ginfo: async (sock, msg) => {
    if (!msg.key.remoteJid.endsWith('@g.us')) return reply(sock, msg, '❌ Réservé aux groupes.');
    try {
      const meta = await sock.groupMetadata(msg.key.remoteJid);
      const admins = meta.participants.filter(p => p.admin);
      const created = new Date(meta.creation * 1000).toLocaleDateString('fr-FR');

      await reply(sock, msg,
        `📋 *INFOS DU GROUPE*\n\n` +
        `📛 *Nom*       : ${meta.subject}\n` +
        `🆔 *ID*        : ${meta.id}\n` +
        `📅 *Créé le*   : ${created}\n` +
        `👥 *Membres*   : ${meta.participants.length}\n` +
        `👑 *Admins*    : ${admins.length}\n` +
        `📝 *Description* :\n${meta.desc || 'Aucune description'}`
      );
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },
};
    
