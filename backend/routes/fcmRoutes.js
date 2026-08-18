const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  registerFcmToken,
  removeFcmToken,
} = require("../controllers/fcmController");

const router = express.Router();

router.post("/token", protect, registerFcmToken);
router.delete("/token", protect, removeFcmToken);

module.exports = router;
