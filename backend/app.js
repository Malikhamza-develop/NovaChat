const express = require("express");

const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require('./routes/userRoutes');
const fcmRoutes = require("./routes/fcmRoutes");
// Temporarily disabled - AI integration will be restored later.
// const aiRoutes = require('./routes/aiRoutes');
const rateLimiter = require("./middleware/rateLimiter");



const app = express();



app.use(
cors()
);



app.use(
express.json()
);

// Apply basic rate limiting to all API routes
app.use('/api', rateLimiter({ windowMs: 60 * 1000, max: 240 }));

app.post("/test", (req, res) => {
  console.log("TEST HIT");
  res.json({ success: true });
});

app.use(
"/api/auth",
authRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use('/api/users', userRoutes);
app.use("/api/fcm", fcmRoutes);
// Temporarily disabled - AI integration will be restored later.
// app.use('/api/ai', aiRoutes);



app.get(
  "/api/health",
  (req, res) => {
    res.json({
      message: "NovaChat API Running",
      status: "ok"
    });
  }
);



module.exports = app;

