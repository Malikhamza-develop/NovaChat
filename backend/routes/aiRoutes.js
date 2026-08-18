const express = require("express");
const {
  handleChat,
  handleSummarize,
  handleSuggestReplies,
  handleRephrase,
  handleTranslate,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/chat", handleChat);
router.post("/summarize", handleSummarize);
router.post("/suggest-replies", handleSuggestReplies);
router.post("/rephrase", handleRephrase);
router.post("/translate", handleTranslate);

module.exports = router;
