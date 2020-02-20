const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'tokenlandia-admin',
  keyFilename: './src/_keys/tokenlandia-admin-eff5ebee14d7.json',
});

module.exports = db;
