const dotenv = require('dotenv');
dotenv.config();

const config = {
  wa_config : {
    phone_number_id: process.env.WA_BUSSINESS_ID_PHONE_NUMBER,
    display_phone_number: process.env.WA_BUSINESS_DISPLAY_PHONE_NUMBER,
    access_token: process.env.WA_BUSINESS_ACCESS_TOKEN
  }
}

module.exports = config;