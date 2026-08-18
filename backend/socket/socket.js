const { Server } = require("socket.io");

const registerSocketHandlers = require("./socketHandlers");
const socketAuth = require("../middleware/socketAuth");

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Use socket-level auth middleware to validate JWT on handshake
  io.use((socket, next) => socketAuth(socket, next));

  io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    registerSocketHandlers(io, socket);
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};