const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication failed"));
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    socket.userId = decoded.id;

    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
};

module.exports = socketAuth;

