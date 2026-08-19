const {
  initializeApp,
  cert,
  getApps,
} = require("firebase-admin/app");

if (getApps().length === 0) {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );
  } else {
    serviceAccount = require(
      "./novachat-ea6e6-firebase-adminsdk-fbsvc-0cc553e7eb.json"
    );
  }

  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = require("firebase-admin");