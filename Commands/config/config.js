import dotenv from 'dotenv';
dotenv.config();

export const config = {
  ownerNumber: process.env.OWNER_NUMBER || '2250170084995',
  ownerName:   process.env.OWNER_NAME   || 'EL CHICANO',
  botName:     process.env.BOT_NAME     || 'CHICANO MD V2',
  prefix:      process.env.PREFIX       || '.',
  version:     '2.1.0',
  sessionId:   process.env.SESSION_ID   || 'chicano_md_session',
  repoUrl:     process.env.REPO_URL     || 'https://github.com/ELCHICANO/CHICANO-MD',

  // APIs
  openaiKey:   process.env.OPENAI_API_KEY   || '',
  weatherKey:  process.env.WEATHER_API_KEY  || '',
  geniusKey:   process.env.GENIUS_API_KEY   || '',

  // Bot behavior
  autoRead:      process.env.AUTO_READ      === 'true',
  autoTyping:    process.env.AUTO_TYPING    === 'true',
  autoRecording: process.env.AUTO_RECORDING === 'true',
};
