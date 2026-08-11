const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.Mixed, required: true },
    to: { type: mongoose.Schema.Types.Mixed, required: true },
    content: { type: String, default: "" },
    clientId: { type: String, default: null },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
    // Enhanced message features
    type: { type: String, enum: ["text", "image", "audio", "system"], default: "text" },
    mediaUrl: { type: String, default: null },
    audioUrl: { type: String, default: null },
    audioDuration: { type: Number, default: 0 },
    channel: { type: String, enum: ["cloud", "wifi_direct", "sim_sms"], default: "cloud" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true },
      },
    ],
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes to improve query performance for conversations and sync
messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ to: 1, createdAt: -1 });
messageSchema.index({ from: 1, clientId: 1 }, { unique: true, sparse: true });
messageSchema.index({ replyTo: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
