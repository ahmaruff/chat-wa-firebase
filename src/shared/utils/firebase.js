const admin = require('firebase-admin');
const config = require('./configs');

require('dotenv').config();

const serviceAccountPath = config.firebase.service_account_path;

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: config.firebase.database_url
});

module.exports = admin;
