import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import { configureBotMenuButton, initBot } from './bot/index.js';
import { ensureDefaultAdmin } from './services/auth.service.js';
import { setIoInstance } from './services/notification.service.js';

const start = async () => {
  await connectDatabase();
  await ensureDefaultAdmin();

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('join:admin', () => socket.join('admin'));
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });

  setIoInstance({
    emit: (event, data) => {
      io.to('admin').emit(event, data);
      io.emit(event, data);
    },
  });

  const bot = initBot();
  if (bot) {
    bot
      .launch()
      .then(async () => {
        console.log('Telegram bot started');
        try {
          await configureBotMenuButton(bot);
        } catch (err) {
          console.warn('Bot menu button setup failed:', err.message);
        }
      })
      .catch((err) => console.warn('Telegram bot failed to start:', err.message));
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
