const {
  addUser,
  removeUser,
  getSocketIds,
  getOnlineUsers,
} = require("./onlineUsers");

const User = require("../models/User");
const Message = require("../models/Message");

const registerSocketHandlers = (io, socket) => {
  // socket.userId is set by socketAuth middleware
  const userId = socket.userId;

  if (!userId) {
    console.log(`Unauthenticated socket attempted connection: ${socket.id}`);
    socket.disconnect(true);
    return;
  }

  addUser(userId, socket.id);

  // If this is the first active socket for the user, mark online in DB & deliver pending messages
  (async () => {
    try {
      const isOnline = await User.exists({ _id: userId, isOnline: true });
      if (!isOnline) {
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
        io.emit("userOnline", { userId });
      }

      // Automatically deliver any messages sent to this user while they were offline
      const undeliveredMessages = await Message.find({ to: userId, status: "sent" }).lean();
      if (undeliveredMessages.length > 0) {
        await Message.updateMany({ to: userId, status: "sent" }, { status: "delivered", deliveredAt: new Date() });
        undeliveredMessages.forEach((m) => {
          const senderSockets = getSocketIds(m.from.toString());
          const updatedMsg = { ...m, status: "delivered" };
          senderSockets.forEach((sid) => io.to(sid).emit("message:delivered", updatedMsg));
        });
      }
    } catch (err) {
      console.error("Error updating user online status:", err.message);
    }
  })();

  io.emit("onlineUsers", getOnlineUsers());

  console.log(`User ${userId} connected on socket ${socket.id}`);

  socket.on("typing", ({ toUserId, isTyping }) => {
    const targetSocketIds = getSocketIds(toUserId);
    targetSocketIds.forEach((sid) => {
      io.to(sid).emit("typing", { fromUserId: userId, isTyping });
    });
  });

  socket.on("sendMessage", async ({ toUserId, message, clientId, type, mediaUrl, audioUrl, audioDuration, channel, replyTo }) => {
    try {
      let msg = clientId
        ? await Message.findOne({ from: userId, clientId }).lean()
        : null;
      const isNewMessage = !msg;

      if (!msg) {
        const created = await Message.create({
          from: userId,
          to: toUserId,
          content: message || "",
          clientId,
          type: type || "text",
          mediaUrl: mediaUrl || null,
          audioUrl: audioUrl || null,
          audioDuration: audioDuration || 0,
          channel: channel || "cloud",
          replyTo: replyTo || null,
          status: "sent",
        });
        msg = created.toObject ? created.toObject() : created;
      }

      const targetSocketIds = getSocketIds(toUserId);

      // If recipient is online, mark delivered
      if (targetSocketIds.length > 0) {
        const updated = await Message.findByIdAndUpdate(
          msg._id,
          { status: "delivered", deliveredAt: new Date() },
          { new: true }
        ).lean();
        if (updated) msg = updated;
      }

      // Send message to recipient sockets.
      // Always emit on retry too (isNewMessage check removed) so the recipient
      // receives the message even if the server saved it but crashed before emitting.
      if (targetSocketIds.length > 0) {
        targetSocketIds.forEach((sid) => {
          io.to(sid).emit("message", msg);
        });
      }

      // emit to sender (ack) and include clientId so client can reconcile optimistic message
      const msgForSender = { ...msg, clientId: clientId || msg.clientId };
      io.to(socket.id).emit("message:sent", msgForSender);
      if (targetSocketIds.length > 0) {
        // Defer delivered ACK to sender so message:sent reconciles clientId→_id first
        setImmediate(() => {
          io.to(socket.id).emit("message:delivered", msgForSender);
        });
      }
    } catch (err) {
      console.error("Error sending message:", err.message);
      // Fallback response so sender UI never stays in infinite 'sending' state
      io.to(socket.id).emit("message:sent", {
        _id: "msg_" + Date.now(),
        clientId,
        from: userId,
        to: toUserId,
        content: message || "",
        status: "sent",
        createdAt: new Date().toISOString(),
        type: type || "text",
        channel: channel || "cloud",
      });
    }
  });

  // Client notifies server a message was delivered/read — update DB and notify other side
  socket.on("messageDelivered", async ({ messageId }) => {
    try {
      const msg = await Message.findOneAndUpdate(
        { _id: messageId, to: userId, status: "sent" },
        { status: "delivered", deliveredAt: new Date() },
        { new: true }
      ).lean();

      if (msg) {
        const targetSocketIds = getSocketIds(msg.from.toString());
        targetSocketIds.forEach((sid) => io.to(sid).emit("message:delivered", msg));
      }
    } catch (err) {
      console.error("Error marking delivered:", err.message);
    }
  });

  socket.on("messageRead", async ({ messageId }) => {
    try {
      const msg = await Message.findOneAndUpdate(
        { _id: messageId, to: userId, status: { $in: ["sent", "delivered"] } },
        { status: "read", readAt: new Date() },
        { new: true }
      ).lean();

      if (msg) {
        const targetSocketIds = getSocketIds(msg.from.toString());
        targetSocketIds.forEach((sid) => io.to(sid).emit("message:read", msg));
      }
    } catch (err) {
      console.error("Error marking read:", err.message);
    }
  });

  socket.on('conversationRead', async ({ fromUserId }) => {
    try {
      const unreadMessages = await Message.find({
        from: fromUserId,
        to: userId,
        status: { $in: ['sent', 'delivered'] },
      }).lean();

      if (unreadMessages.length === 0) return;

      const readAt = new Date();
      await Message.updateMany(
        { _id: { $in: unreadMessages.map((message) => message._id) } },
        { status: 'read', readAt },
      );

      const senderSocketIds = getSocketIds(fromUserId);
      unreadMessages.forEach((message) => {
        const updatedMessage = { ...message, status: 'read', readAt };
        senderSocketIds.forEach((sid) => io.to(sid).emit('message:read', updatedMessage));
      });
    } catch (err) {
      console.error('Error marking conversation read:', err.message);
    }
  });

  // React to a message
  socket.on('reactMessage', async ({ messageId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      const isParticipant =
        message.from.toString() === userId.toString() ||
        message.to.toString() === userId.toString();
      if (!isParticipant) return;

      const existingIndex = message.reactions.findIndex(
        (r) => r.user.toString() === userId.toString() && r.emoji === emoji,
      );

      if (existingIndex >= 0) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions = message.reactions.filter(
          (r) => r.user.toString() !== userId.toString(),
        );
        message.reactions.push({ user: userId, emoji });
      }

      await message.save();
      const updated = await Message.findById(messageId)
        .populate('reactions.user', 'name avatar')
        .lean();

      const targetSocketIds = getSocketIds(message.to.toString());
      const senderSocketIds = getSocketIds(message.from.toString());

      const payload = { ...updated, clientId: updated.clientId };
      io.to(socket.id).emit('message:reaction', payload);
      targetSocketIds.forEach((sid) => {
        if (sid !== socket.id) io.to(sid).emit('message:reaction', payload);
      });
      senderSocketIds.forEach((sid) => {
        if (sid !== socket.id) io.to(sid).emit('message:reaction', payload);
      });
    } catch (err) {
      console.error('Error reacting to message:', err.message);
    }
  });

  // Delete a message
  socket.on('deleteMessage', async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;
      if (message.from.toString() !== userId.toString()) return;

      message.deletedAt = new Date();
      message.deletedBy = userId;
      message.content = '';
      message.mediaUrl = null;
      await message.save();

      const updated = await Message.findById(messageId).lean();
      const targetSocketIds = getSocketIds(message.to.toString());

      const payload = { ...updated, clientId: updated.clientId };
      io.to(socket.id).emit('message:deleted', payload);
      targetSocketIds.forEach((sid) => {
        if (sid !== socket.id) io.to(sid).emit('message:deleted', payload);
      });
    } catch (err) {
      console.error('Error deleting message:', err.message);
    }
  });

  // Call Signaling Handlers for Realtime Calls across devices/users
  socket.on("call:invite", ({ toUserId, callType, channel, callerName, callerAvatar }) => {
    const targetSockets = getSocketIds(toUserId);
    targetSockets.forEach((sid) => {
      io.to(sid).emit("call:invite", {
        fromUserId: userId,
        callerName,
        callerAvatar,
        callType,
        channel,
      });
    });
  });

  socket.on("call:accepted", ({ toUserId }) => {
    const targetSockets = getSocketIds(toUserId);
    targetSockets.forEach((sid) => {
      io.to(sid).emit("call:accepted", { fromUserId: userId });
    });
  });

  socket.on("call:declined", ({ toUserId }) => {
    const targetSockets = getSocketIds(toUserId);
    targetSockets.forEach((sid) => {
      io.to(sid).emit("call:declined", { fromUserId: userId });
    });
  });

  socket.on("call:ended", ({ toUserId }) => {
    const targetSockets = getSocketIds(toUserId);
    targetSockets.forEach((sid) => {
      io.to(sid).emit("call:ended", { fromUserId: userId });
    });
  });

  socket.on("disconnect", async () => {
    const { userId: removedUserId, wentOffline } = removeUser(socket.id);

    if (wentOffline && removedUserId) {
      try {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(removedUserId, { isOnline: false, lastSeen });
        io.emit("userOffline", { userId: removedUserId, lastSeen });
      } catch (err) {
        console.error("Error updating user offline status:", err.message);
      }
    }

    io.emit("onlineUsers", getOnlineUsers());

    console.log(`Socket disconnected: ${socket.id}`);
  });
};

module.exports = registerSocketHandlers;
