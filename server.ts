import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

// @ts-ignore
import app from './backend/app.js';
// @ts-ignore
import connectDB from './backend/config/database.js';
// @ts-ignore
import { initializeSocket } from './backend/socket/socket.js';

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  const server = http.createServer(app);

  initializeSocket(server);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaChat API & Socket.IO running on http://0.0.0.0:${PORT}`);
  });

  connectDB().catch((err: unknown) => console.error('Database connection error:', err));
}

startServer();
