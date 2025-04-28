const admin = require('firebase-admin');
const config = require('./configs');
const path = require('path');

require('dotenv').config();

const serviceAccountPath = config.firebase.service_account_path;

const keyPath = path.resolve(process.cwd(), config.firebase.service_account_path);
const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase.database_url
});

module.exports = admin;
