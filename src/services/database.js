const Firestore = require('@google-cloud/firestore');

// TODO configure

const db = new Firestore({
  projectId: 'YOUR_PROJECT_ID',
  keyFilename: '/path/to/keyfile.json',
});

module.exports = db;
