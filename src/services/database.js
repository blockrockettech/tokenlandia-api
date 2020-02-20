const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'tokenlandia-admin',
  keyFilename: require('../_keys/tokenlandia-admin-eff5ebee14d7'),
});

module.exports = db;
