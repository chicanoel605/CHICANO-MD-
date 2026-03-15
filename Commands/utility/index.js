import axios from 'axios';
import { reply, react, sendTyping } from '../../lib/utils.js';
import { config } from '../../config/config.js';

export const utilityCommands = {

  // ─── .rvo (Supprimer vue unique / anti-view-once) ────────
  rvo: async (sock, msg) => {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) return reply(sock, msg, '❌ Réponds à un message "vue unique" avec *.rvo*');

      // Cherche le contenu viewOnce
      const voMsg =
        quoted.viewOnceMessage?.message ||
        quoted.viewOnceMessageV2?.message ||
        quoted.viewOnceMessageV2Extension?.message;

      if (!voMsg) return reply(sock, msg, '❌ Ce message n\'est pas une vue unique.');

      const imageMsg = voMsg.imageMessage;
      const videoMsg = voMsg.videoMessage;

      if (imageMsg) {
        const buffer = await sock.downloadMediaMessage({ message: voMsg });
        await sock.sendMessage(msg.key.remoteJid, {
          image: buffer,
          caption: '🔓 *Vue unique déverrouillée !*\n_CHICANO MD_',
        }, { quoted: msg });
      } else if (videoMsg) {
        const buffer = await sock.downloadMediaMessage({ message: voMsg });
        await sock.sendMessage(msg.key.remoteJid, {
          video: buffer,
          caption: '🔓 *Vue unique déverrouillée !*\n_CHICANO MD_',
        }, { quoted: msg });
      } else {
        await reply(sock, msg, '❌ Type de média non supporté.');
      }
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .save (Sauvegarder un média en DM) ──────────────────
  save: async (sock, msg) => {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) return reply(sock, msg, '❌ Réponds à un média avec *.save*');

      const imageMsg = quoted.imageMessage;
      const videoMsg = quoted.videoMessage;
      const audioMsg = quoted.audioMessage;
      const stickerMsg = quoted.stickerMessage;

      const senderJid = msg.key.participant || msg.key.remoteJid;

      if (imageMsg) {
        const buffer = await sock.downloadMediaMessage({ message: quoted });
        await sock.sendMessage(senderJid, {
          image: buffer,
          caption: '✅ *Image sauvegardée !*\n_CHICANO MD_',
        });
        await react(sock, msg, '✅');
      } else if (videoMsg) {
        const buffer = await sock.downloadMediaMessage({ message: quoted });
        await sock.sendMessage(senderJid, {
          video: buffer,
          caption: '✅ *Vidéo sauvegardée !*\n_CHICANO MD_',
        });
        await react(sock, msg, '✅');
      } else if (audioMsg) {
        const buffer = await sock.downloadMediaMessage({ message: quoted });
        await sock.sendMessage(senderJid, {
          audio: buffer,
          mimetype: 'audio/mpeg',
        });
        await react(sock, msg, '✅');
      } else if (stickerMsg) {
        const buffer = await sock.downloadMediaMessage({ message: quoted });
        await sock.sendMessage(senderJid, {
          sticker: buffer,
        });
        await react(sock, msg, '✅');
      } else {
        await reply(sock, msg, '❌ Type de média non supporté pour .save');
      }
    } catch (e) {
      await reply(sock, msg, `❌ Erreur : ${e.message}`);
    }
  },

  // ─── .pair (Code de jumelage WhatsApp) ───────────────────
  pair: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.pair* <numéro>\nExemple : *.pair* 2250100000000`);
    await react(sock, msg, '🔗');
    await reply(sock, msg,
      `🔗 *CHICANO MD - Jumelage*\n\n` +
      `📱 Numéro : *${args[0]}*\n\n` +
      `_Pour générer un code de jumelage, utilise le script de connexion._\n` +
      `🔗 ${config.repoUrl}`
    );
  },

  // ─── .weather (Météo) ─────────────────────────────────────
  weather: async (sock, msg, args) => {
    if (!args.length) return reply(sock, msg, `❌ Usage : *.weather* <ville>`);
    await react(sock, msg, '🌤');
    await sendTyping(sock, msg.key.remoteJid);
    try {
      const city = args.join(' ');
      const apiKey = config.weatherKey;

      if (!apiKey) {
        // Utilise API gratuite sans clé
        const apiUrl = `https://api.giftedtech.web.id/api/tools/weather?apikey=gifted&city=${encodeURIComponent(city)}`;
        const res = await axios.get(apiUrl, { timeout: 15000 });
        const data = res.data?.result || res.data;

        if (!data) throw new Error('Données météo introuvables');

        await reply(sock, msg,
          `🌤 *MÉTÉO - ${city.toUpperCase()}*\n\n` +
          `🌡 Température  : ${data.temperature || data.temp || 'N/A'}\n` +
          `💧 Humidité     : ${data.humidity || 'N/A'}\n` +
          `🌬 Vent         : ${data.wind || 'N/A'}\n` +
          `☁️ Condition    : ${data.condition || data.description || 'N/A'}\n\n` +
          `_Météo via CHICANO MD_`
        );
      } else {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`,
          { timeout: 15000 }
        );
        const w = res.data;
        await reply(sock, msg,
          `🌤 *MÉTÉO - ${w.name.toUpperCase()}, ${w.sys.country}*\n\n` +
          `🌡 Température  : *${Math.round(w.main.temp)}°C* (ressenti ${Math.round(w.main.feels_like)}°C)\n` +
          `🌡 Min/Max      : ${Math.round(w.main.temp_min)}°C / ${Math.round(w.main.temp_max)}°C\n` +
          `💧 Humidité     : *${w.main.humidity}%*\n` +
          `🌬 Vent         : *${Math.round(w.wind.speed * 3.6)} km/h*\n` +
          `☁️ Condition    : *${w.weather[0].description}*\n` +
          `👁 Visibilité   : ${(w.visibility / 1000).toFixed(1)} km\n\n` +
          `_Météo via CHICANO MD_`
        );
      }
    } catch (e) {
      await reply(sock, msg, `❌ Ville introuvable ou erreur : ${e.message}`);
    }
  },
};
      
