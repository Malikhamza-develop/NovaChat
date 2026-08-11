const mongoose = require('mongoose');

const conversationPreferenceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

conversationPreferenceSchema.index({ owner: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('ConversationPreference', conversationPreferenceSchema);
