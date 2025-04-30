const dotenv = require('dotenv');
dotenv.config();

const config = {
  wa_config : {
    phone_number_id: process.env.WA_BUSSINESS_ID_PHONE_NUMBER,
    display_phone_number: process.env.WA_BUSINESS_DISPLAY_PHONE_NUMBER,
    access_token: process.env.WA_BUSINESS_ACCESS_TOKEN
  },
  firebase: {
    service_account_path: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    database_url: process.env.FIREBASE_DATABASE_URL,
    chat_collection: process.env.FIREBASE_CHAT_COLLECTION,
    thread_collection: process.env.FIREBASE_THREAD_COLLECITON,
    channel_collection: process.env.FIREBASE_CHANNEL_COLLECTION 
  },
  whatsapp: {
    verify_token: process.env.WHATSAPP_VERIFY_TOKEN,
  }
}

module.exports = config;