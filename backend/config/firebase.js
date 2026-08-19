const { initializeApp, applicationDefault, getApps } = require("firebase-admin/app");

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
  });
}

module.exports = require("firebase-admin");
