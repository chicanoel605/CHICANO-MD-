import axios from 'axios';
import { reply, react, sendTyping } from '../../lib/utils.js';
import ytSearch from 'yt-search';

export const downloadCommands = {

  // ─── .play (Audio YouTube) ───────────────────────────────
  play: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.play* <titre de la chanson>`);
    await react(sock, msg, '🎵');
    await sendTyping(sock, msg.key.remoteJid);
    try {
      const query = args.join(' ');
      const results = await ytSearch(query);
      const video = results.videos[0];
      if (!video) return reply(sock, msg, '❌ Aucun résultat trouvé.');

      await reply(sock, msg,
        `🎵 *${video.title}*\n` +
        `👤 ${video.author.name}\n` +
        `⏱ ${video.timestamp}\n` +
        `🔗 ${video.url}\n\n` +
        `_Téléchargement en cours..._`
      );

      // Download via API gratuite
      const apiUrl = `https://api.giftedtech.web.id/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(video.url)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;

      if (!data?.result?.download_url) throw new Error('Lien audio introuvable');

      await sock.sendMessage(msg.key.remoteJid, {
        audio: { url: data.result.download_url },
        mimetype: 'audio/mpeg',
        ptt: false,
      }, { quoted: msg });

    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .video (Vidéo YouTube) ──────────────────────────────
  video: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.video* <titre ou lien YouTube>`);
    await react(sock, msg, '🎬');
    await sendTyping(sock, msg.key.remoteJid);
    try {
      const query = args.join(' ');
      let videoUrl = query;

      if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const results = await ytSearch(query);
        const video = results.videos[0];
        if (!video) return reply(sock, msg, '❌ Aucun résultat trouvé.');
        videoUrl = video.url;
        await reply(sock, msg, `🎬 *${video.title}*\n⏱ ${video.timestamp}\n\n_Téléchargement en cours..._`);
      }

      const apiUrl = `https://api.giftedtech.web.id/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });
      const data = res.data;

      if (!data?.result?.download_url) throw new Error('Lien vidéo introuvable');

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: data.result.download_url },
        caption: `🎬 *CHICANO MD* | Téléchargé avec *.video*`,
      }, { quoted: msg });

    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .yts (Recherche YouTube) ────────────────────────────
  yts: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.yts* <titre>`);
    await react(sock, msg, '🔍');
    try {
      const results = await ytSearch(args.join(' '));
      const videos = results.videos.slice(0, 5);
      if (!videos.length) return reply(sock, msg, '❌ Aucun résultat trouvé.');

      let text = `🔍 *Résultats YouTube pour :* _${args.join(' ')}_\n\n`;
      videos.forEach((v, i) => {
        text += `${i + 1}. *${v.title}*\n`;
        text += `   👤 ${v.author.name} | ⏱ ${v.timestamp}\n`;
        text += `   🔗 ${v.url}\n\n`;
      });
      await reply(sock, msg, text);
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .facebook ───────────────────────────────────────────
  facebook: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.facebook* <lien>`);
    await react(sock, msg, '📘');
    try {
      const apiUrl = `https://api.giftedtech.web.id/api/download/facebook?apikey=gifted&url=${encodeURIComponent(args[0])}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;
      if (!data?.result?.hd || !data?.result?.sd) throw new Error('Lien introuvable');

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: data.result.hd || data.result.sd },
        caption: `📘 *Facebook Vidéo téléchargée !*\n_CHICANO MD_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .ig (Instagram) ─────────────────────────────────────
  ig: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.ig* <lien Instagram>`);
    await react(sock, msg, '📸');
    try {
      const apiUrl = `https://api.giftedtech.web.id/api/download/instagram?apikey=gifted&url=${encodeURIComponent(args[0])}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;
      if (!data?.result) throw new Error('Contenu introuvable');

      const mediaUrl = Array.isArray(data.result) ? data.result[0]?.url : data.result?.url;
      if (!mediaUrl) throw new Error('Lien media introuvable');

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: mediaUrl },
        caption: `📸 *Instagram media téléchargé !*\n_CHICANO MD_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .tt (TikTok) ────────────────────────────────────────
  tt: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.tt* <lien TikTok>`);
    await react(sock, msg, '🎵');
    try {
      const apiUrl = `https://api.giftedtech.web.id/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(args[0])}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;
      if (!data?.result?.no_watermark) throw new Error('Lien introuvable');

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: data.result.no_watermark },
        caption: `🎵 *TikTok téléchargé sans watermark !*\n_CHICANO MD_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .pinterest ──────────────────────────────────────────
  pinterest: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.pinterest* <lien>`);
    await react(sock, msg, '📌');
    try {
      const apiUrl = `https://api.giftedtech.web.id/api/download/pinterest?apikey=gifted&url=${encodeURIComponent(args[0])}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;
      if (!data?.result?.url) throw new Error('Lien introuvable');

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: data.result.url },
        caption: `📌 *Pinterest image téléchargée !*\n_CHICANO MD_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .tourl (Fichier → URL) ───────────────────────────────
  tourl: async (sock, msg, args) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return reply(sock, msg, `❌ Réponds à un média avec *.tourl* pour obtenir son URL.`);
    await react(sock, msg, '🔗');
    await reply(sock, msg, `🔗 *Upload en cours...*\n_Cette fonctionnalité nécessite un hébergeur de fichiers configuré._`);
  },
};
      
