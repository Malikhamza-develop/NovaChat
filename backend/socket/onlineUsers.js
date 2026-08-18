const onlineUsers = new Map();

// Stores multiple socket IDs per user to support multi-device
const addUser = (userId, socketId) => {
  const sockets = onlineUsers.get(userId) || new Set();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
};

// Removes a socketId and returns an object { userId, wentOffline }
// wentOffline === true when user has no more active sockets
const removeUser = (socketId) => {
  for (const [userId, sockets] of onlineUsers.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);

      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        return { userId, wentOffline: true };
      }

      // update the set
      onlineUsers.set(userId, sockets);
      return { userId, wentOffline: false };
    }
  }

  return { userId: null, wentOffline: false };
};

const getSocketIds = (userId) => {
  const sockets = onlineUsers.get(userId);
  return sockets ? Array.from(sockets) : [];
};

const isOnline = (userId) => {
  return onlineUsers.has(userId);
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = {
  addUser,
  removeUser,
  getSocketIds,
  isOnline,
  getOnlineUsers,
};