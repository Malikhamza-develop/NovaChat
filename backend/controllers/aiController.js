const { GoogleGenAI } = require("@google/genai");

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Chat Handler
exports.handleChat = async (req, res) => {
  try {
    const { prompt, history = [], systemInstruction } = req.body;

    if (!prompt && (!history || history.length === 0)) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const ai = getGenAIClient();

    if (!ai) {
      // Friendly fallback if API key isn't set in environment
      return res.json({
        success: true,
        reply: "Hello! I am Nova AI ✨. Currently, the Gemini API key is being initialized. Once process.env.GEMINI_API_KEY is active in your environment, I can answer any questions, summarize chats, generate code, translate languages, and much more!",
      });
    }

    const defaultSysInstruction =
      "You are Nova AI ✨, an intelligent, friendly, and highly capable assistant embedded directly inside NovaChat — a modern, real-time messaging application with Cloud, Wi-Fi Direct, and SIM SMS channels.\n" +
      "Provide clear, concise, accurate, and beautifully structured responses. Use formatting (bullet points, bolding, emojis, code blocks) appropriately for a mobile/web chat experience.";

    const formattedHistory = Array.isArray(history)
      ? history
          .filter((m) => m && m.content)
          .map((m) => ({
            role: m.from === 'nova-ai' || m.role === 'model' || m.isAi ? 'model' : 'user',
            parts: [{ text: m.content || '' }],
          }))
      : [];

    // Construct request contents
    const contents = [...formattedHistory];
    if (prompt) {
      contents.push({ role: 'user', parts: [{ text: prompt }] });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents.length > 0 ? contents : prompt,
      config: {
        systemInstruction: systemInstruction || defaultSysInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm sorry, I couldn't generate a response at this moment.";

    return res.json({
      success: true,
      reply: replyText,
    });
  } catch (error) {
    console.error("Nova AI Chat Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to communicate with AI service",
      reply: "I encountered a momentary issue connecting to Nova AI servers. Please try again in a moment! ✨",
    });
  }
};

// Summarize Conversation Handler
exports.handleSummarize = async (req, res) => {
  try {
    const { messages = [], contactName = "this chat" } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, error: "No messages provided to summarize" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        summary: "📌 **Chat Summary (Local Preview)**\n- Discussion with " + contactName + "\n- Total messages exchanged: " + messages.length + "\n- Connect GEMINI_API_KEY for deep AI narrative summaries!",
      });
    }

    const conversationTranscript = messages
      .slice(-20)
      .map((m) => `${m.senderName || (m.from === 'user_current' ? 'Me' : contactName)}: ${m.content}`)
      .join("\n");

    const prompt = `Summarize the following recent chat conversation with ${contactName} clearly and concisely.\n` +
      `Include:\n` +
      `1. Quick 1-sentence Overview\n` +
      `2. Bullet points of key details or decisions\n` +
      `3. Any pending action items or follow-ups\n\n` +
      `Conversation:\n${conversationTranscript}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert executive chat summarizer for NovaChat. Keep outputs concise, beautifully structured, and actionable.",
      },
    });

    return res.json({
      success: true,
      summary: response.text || "Could not generate summary.",
    });
  } catch (error) {
    console.error("Nova AI Summarize Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      summary: "Failed to summarize conversation. Please check your network or try again.",
    });
  }
};

// Suggest Quick Replies Handler
exports.handleSuggestReplies = async (req, res) => {
  try {
    const { messages = [], contactName = "friend" } = req.body;

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        suggestions: [
          `Sounds great, ${contactName}! 👍`,
          "Let me check and get back to you shortly.",
          "Thanks for letting me know! 🚀",
        ],
      });
    }

    const conversationTranscript = messages
      .slice(-10)
      .map((m) => `${m.from === 'user_current' ? 'Me' : contactName}: ${m.content}`)
      .join("\n");

    const prompt = `Based on the following recent chat conversation with ${contactName}, generate 3 short, natural, context-aware quick reply options that 'Me' could send next.\n` +
      `Format the output strictly as a JSON array of strings, e.g. ["Option 1", "Option 2", "Option 3"].\n\n` +
      `Conversation:\n${conversationTranscript}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let suggestions = [];
    try {
      suggestions = JSON.parse(response.text);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch {
      suggestions = [
        "Sounds good! 👍",
        "Got it, thanks!",
        "Let's catch up on this soon.",
      ];
    }

    return res.json({
      success: true,
      suggestions: suggestions.slice(0, 3),
    });
  } catch (error) {
    console.error("Nova AI Suggest Replies Error:", error);
    return res.json({
      success: true,
      suggestions: [
        "Sounds good! 👍",
        "Got it, thanks!",
        "I'll check and let you know.",
      ],
    });
  }
};

// Rephrase / Tone Adjustment Handler
exports.handleRephrase = async (req, res) => {
  try {
    const { text, tone = "professional" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        rephrased: text,
      });
    }

    const prompt = `Rewrite the following message draft to sound ${tone}.\n` +
      `Maintain the original meaning, keep it clear and natural for a instant messaging app. Return ONLY the rewritten text without surrounding quotes or explanations.\n\n` +
      `Original text:\n"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return res.json({
      success: true,
      rephrased: (response.text || text).trim(),
    });
  } catch (error) {
    console.error("Nova AI Rephrase Error:", error);
    return res.status(500).json({ success: false, error: error.message, rephrased: req.body.text });
  }
};

// Translate Message Handler
exports.handleTranslate = async (req, res) => {
  try {
    const { text, targetLanguage = "Spanish" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        success: true,
        translatedText: `[Translated to ${targetLanguage}]: ${text}`,
      });
    }

    const prompt = `Translate the following chat message into ${targetLanguage}.\n` +
      `Ensure natural conversational phrasing appropriate for a chat message. Return ONLY the translation.\n\n` +
      `Message: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return res.json({
      success: true,
      translatedText: (response.text || text).trim(),
    });
  } catch (error) {
    console.error("Nova AI Translate Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
