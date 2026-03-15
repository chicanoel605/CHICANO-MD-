import axios from 'axios';
import { reply, react, sendTyping } from '../../lib/utils.js';
import { config } from '../../config/config.js';

export const aiCommands = {

  // ─── .ai (ChatGPT / IA) ──────────────────────────────────
  ai: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.ai* <ta question>`);
    await react(sock, msg, '🤔');
    await sendTyping(sock, msg.key.remoteJid);
    try {
      const question = args.join(' ');

      // Utilise API gratuite (GPT via proxy)
      const apiUrl = `https://api.giftedtech.web.id/api/ai/gpt4?apikey=gifted&prompt=${encodeURIComponent(question)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const answer = res.data?.result || res.data?.message || 'Aucune réponse.';

      await react(sock, msg, '✅');
      await reply(sock, msg,
        `🧠 *CHICANO AI*\n\n` +
        `❓ *Question :* ${question}\n\n` +
        `💡 *Réponse :*\n${answer}`
      );
    } catch (e) {
      // Fallback si API indisponible
      await reply(sock, msg,
        `🧠 *CHICANO AI*\n\n` +
        `❓ *Question :* ${args.join(' ')}\n\n` +
        `⚠️ Le service IA est temporairement indisponible.\n` +
        `_Configure OPENAI_API_KEY dans .env pour utiliser GPT._`
      );
    }
  },

  // ─── .image (Génération d'image IA) ──────────────────────
  image: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.image* <description de l'image>`);
    await react(sock, msg, '🎨');
    await sendTyping(sock, msg.key.remoteJid);
    try {
      const prompt = args.join(' ');
      const apiUrl = `https://api.giftedtech.web.id/api/ai/imagine?apikey=gifted&prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl, { timeout: 60000, responseType: 'arraybuffer' });

      if (res.headers['content-type']?.includes('image')) {
        await sock.sendMessage(msg.key.remoteJid, {
          image: Buffer.from(res.data),
          caption: `🎨 *Image générée par IA !*\n📝 Prompt : _${prompt}_\n\n_CHICANO MD_`,
        }, { quoted: msg });
      } else {
        const data = JSON.parse(Buffer.from(res.data).toString());
        const imageUrl = data?.result || data?.url;
        if (!imageUrl) throw new Error('Image introuvable');

        await sock.sendMessage(msg.key.remoteJid, {
          image: { url: imageUrl },
          caption: `🎨 *Image générée par IA !*\n📝 Prompt : _${prompt}_\n\n_CHICANO MD_`,
        }, { quoted: msg });
      }
      await react(sock, msg, '✅');
    } catch (e) {
      await reply(sock, msg, `❌ Erreur génération d'image : ${e.message}`);
    }
  },

  // ─── .lyrics (Paroles de chanson) ────────────────────────
  lyrics: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.lyrics* <titre de la chanson>`);
    await react(sock, msg, '🎤');
    await sendTyping(sock, msg.key.remoteJid);
    try {
      const query = args.join(' ');
      const apiUrl = `https://api.giftedtech.web.id/api/search/lyrics?apikey=gifted&songname=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;

      if (!data?.result?.lyrics) throw new Error('Paroles introuvables');

      const { title, artist, lyrics } = data.result;
      const truncated = lyrics.length > 3000 ? lyrics.substring(0, 3000) + '...\n\n_[Tronqué]_' : lyrics;

      await reply(sock, msg,
        `🎤 *${title}*\n👤 *${artist}*\n\n` +
        `${truncated}\n\n` +
        `_Paroles via CHICANO MD_`
      );
    } catch (e) {
      await reply(sock, msg, `❌ Paroles introuvables pour : _${args.join(' ')}_`);
    }
  },
};
  
