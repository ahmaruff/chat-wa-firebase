const dotenv = require('dotenv');
dotenv.config();

const config = {
  firebase: {
    service_account_path: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    database_url: process.env.FIREBASE_DATABASE_URL,
    chat_collection: process.env.FIREBASE_CHAT_COLLECTION,
    thread_collection: process.env.FIREBASE_THREAD_COLLECITON,
    channel_collection: process.env.FIREBASE_CHANNEL_COLLECTION,
    wa_config_collection: process.env.FIREBASE_WA_CONFIG_COLLECTION
  },
  whatsapp: {
    verify_token: process.env.WHATSAPP_VERIFY_TOKEN,
    api_base_url: process.env.WHATSAPP_API_BASE_URL ?? "https://graph.facebook.com/v22.0",
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY
  }
}

module.exports = config;