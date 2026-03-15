 🤖 CHICANO MD V2

<div align="center">
  <img src="https://img.shields.io/badge/Version-2.1.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/WhatsApp-Bot-brightgreen?style=for-the-badge&logo=whatsapp" />
  <img src="https://img.shields.io/badge/Owner-EL%20CHICANO-red?style=for-the-badge" />
</div>

---

## 📋 Fonctionnalités

| Catégorie | Commandes |
|-----------|-----------|
| 📦 **Download** | .play .video .facebook .ig .tt .pinterest .yts .tourl |
| 🧠 **AI Engine** | .ai .image .lyrics |
| 👥 **Group Control** | .tagall .hidetag .join .leave .gstatus .kick .add .promote .demote .close .open .grouplink .revoke .setname .setdesc .ginfo |
| 👑 **Owner** | .owner .fullpp .getpp |
| ⚡ **Bot Core** | .alive .ping .speed .menu .repo .script |
| 🛠 **Utility** | .rvo .save .pair .weather |

---

## 🚀 Installation

### Prérequis
- Node.js **18+**
- npm ou yarn
- Un numéro WhatsApp actif

### Étapes

```bash
# 1. Clone le dépôt
git clone https://github.com/ELCHICANO/CHICANO-MD.git
cd CHICANO-MD

# 2. Installe les dépendances
npm install

# 3. Configure le bot
cp .env .env.local
# Édite .env avec ton numéro et tes clés API

# 4. Lance le bot
npm start
```

### 4. Scanne le QR Code
Un QR code apparaîtra dans le terminal. Scanne-le avec WhatsApp :
> **WhatsApp** → **Appareils liés** → **Lier un appareil**

---

## ⚙️ Configuration (.env)

```env
OWNER_NUMBER=2250170084995    # Ton numéro complet avec indicatif
OWNER_NAME=EL CHICANO         # Ton nom
BOT_NAME=CHICANO MD V2        # Nom du bot
PREFIX=.                      # Préfixe des commandes

# APIs optionnelles
WEATHER_API_KEY=              # https://openweathermap.org
OPENAI_API_KEY=               # https://platform.openai.com
```

---

## 📦 Structure du projet

```
CHICANO-MD/
├── index.js              # Point d'entrée
├── config/
│   └── config.js         # Configuration centralisée
├── lib/
│   ├── handler.js        # Gestionnaire de messages
│   └── utils.js          # Fonctions utilitaires
├── commands/
│   ├── core/             # .alive .ping .speed .menu...
│   ├── download/         # .play .video .ig .tt...
│   ├── ai/               # .ai .image .lyrics
│   ├── group/            # .tagall .kick .promote...
│   ├── owner/            # .owner .fullpp .getpp
│   └── utility/          # .rvo .save .weather...
├── .env                  # Configuration (à personnaliser)
└── package.json
```

---

## 💡 Ajouter une commande

Crée un fichier dans le bon dossier `commands/` :

```js
// commands/macat/index.js
export const maCatCommands = {
  macommande: async (sock, msg, args) => {
    // ton code ici
    await sock.sendMessage(msg.key.remoteJid, 
      { text: 'Hello !' }, { quoted: msg }
    );
  }
};
```

Puis importe-la dans `lib/handler.js`.

---

## 🤝 Contribution

1. Fork le projet
2. Crée une branche : `git checkout -b feature/ma-commande`
3. Commit : `git commit -m 'Ajout: ma-commande'`
4. Push : `git push origin feature/ma-commande`
5. Ouvre une Pull Request

---

## 📄 Licence

MIT © [EL CHICANO](https://github.com/ELCHICANO)

---

<div align="center">
  <b>⭐ N'oublie pas de star le repo si tu aimes CHICANO MD !</b>
</div>

