import http from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// @ts-ignore
import app from "./backend/app.js";
// @ts-ignore
import connectDB from "./backend/config/database.js";
// @ts-ignore
import { initializeSocket } from "./backend/socket/socket.js";

const PORT = 3000;

async function startServer() {
  await connectDB();

  const server = http.createServer(app);

  initializeSocket(server);

  const distPath = path.join(process.cwd(), "dist");
  const distExists = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production" || !distExists) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*all", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`NovaChat Full-Stack Server & Socket.IO running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
