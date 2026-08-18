const express = require("express");
const {
  createMessage,
  getConversation,
  getConversations,
  updateConversationPreference,
  syncMessages,
  markDelivered,
  markRead,
  toggleReaction,
  deleteMessage,
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const validateMessage = require('../middleware/validateMessage');

router.post("/", validateMessage, createMessage);
router.get("/conversation/:userId", getConversation);
router.get("/conversations", getConversations);
router.patch('/conversations/:userId', updateConversationPreference);
router.get("/sync", syncMessages);
router.patch("/:messageId/delivered", markDelivered);
router.patch("/:messageId/read", markRead);
router.post("/:messageId/reactions", toggleReaction);
router.delete("/:messageId", deleteMessage);

module.exports = router;
