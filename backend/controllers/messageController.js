const Message = require("../models/Message");
const ConversationPreference = require('../models/ConversationPreference');

const createMessage = async (req, res) => {
  try {
    const { to, content } = req.body;

    const message = await Message.create({ from: req.user._id, to, content });

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Create message error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params; // other participant
    // pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id },
      ],
    });

    return res.status(200).json({ messages, page, limit, total });
  } catch (error) {
    console.error("Get conversation error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Sync messages for device since a timestamp
const syncMessages = async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }],
      createdAt: { $gt: since },
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Sync messages error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const ObjectId = require('mongoose').Types.ObjectId;
    const userObjectId = new ObjectId(userId);

    const conv = await Message.aggregate([
      {
        $match: {
          $or: [{ from: userObjectId }, { to: userObjectId }],
        },
      },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ['$from', userObjectId] }, '$to', '$from'],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$to', userObjectId] }, { $ne: ['$status', 'read'] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          avatar: '$user.avatar',
          online: '$user.isOnline',
          lastSeen: '$user.lastSeen',
          lastMessage: '$lastMessage.content',
          lastAt: '$lastMessage.createdAt',
          unreadCount: 1,
        },
      },
      { $sort: { lastAt: -1 } },
    ]).exec();

    const preferences = await ConversationPreference.find({
      owner: userId,
      participant: { $in: conv.map((item) => item.userId) },
    }).lean();
    const preferencesByParticipant = new Map(
      preferences.map((item) => [item.participant.toString(), item]),
    );

    const conversations = conv.map((item) => {
      const preference = preferencesByParticipant.get(item.userId.toString());
      return {
        ...item,
        userId: item.userId.toString(),
        pinned: preference?.pinned ?? false,
        archived: preference?.archived ?? false,
      };
    });

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

const updateConversationPreference = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = {};

    if (typeof req.body.pinned === 'boolean') updates.pinned = req.body.pinned;
    if (typeof req.body.archived === 'boolean') updates.archived = req.body.archived;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid conversation preference supplied' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'A conversation must have another participant' });
    }

    const preference = await ConversationPreference.findOneAndUpdate(
      { owner: req.user._id, participant: userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return res.status(200).json({
      preference: {
        userId: preference.participant.toString(),
        pinned: preference.pinned,
        archived: preference.archived,
      },
    });
  } catch (error) {
    console.error('Update conversation preference error:', error.message);
    return res.status(500).json({ message: 'Unable to update conversation preference' });
  }
};

const markDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, to: req.user._id, status: "sent" },
      { status: "delivered", deliveredAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found or cannot be updated" });
    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Mark delivered error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        to: req.user._id,
        status: { $in: ["sent", "delivered"] },
      },
      { status: "read", readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found or cannot be updated" });
    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Mark read error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Toggle a reaction on a message
const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji || typeof emoji !== 'string') {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only participants can react
    const isParticipant =
      message.from.toString() === userId.toString() ||
      message.to.toString() === userId.toString();
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji,
    );

    if (existingIndex >= 0) {
      // Remove reaction
      message.reactions.splice(existingIndex, 1);
    } else {
      // Remove any previous reaction by this user (one reaction per user)
      message.reactions = message.reactions.filter(
        (r) => r.user.toString() !== userId.toString(),
      );
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    const updated = await Message.findById(messageId)
      .populate('reactions.user', 'name avatar')
      .lean();

    return res.status(200).json({ message: updated });
  } catch (error) {
    console.error('Toggle reaction error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Soft-delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.from.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    message.deletedAt = new Date();
    message.deletedBy = userId;
    message.content = '';
    message.mediaUrl = null;
    await message.save();

    const updated = await Message.findById(messageId).lean();

    return res.status(200).json({ message: updated });
  } catch (error) {
    console.error('Delete message error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMessage,
  getConversation,
  getConversations,
  updateConversationPreference,
  syncMessages,
  markDelivered,
  markRead,
  toggleReaction,
  deleteMessage,
};
