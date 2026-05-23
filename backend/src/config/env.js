import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/faiza_cafe',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminPhone: process.env.ADMIN_PHONE || '+998901234567',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
  telegramBotToken: (() => {
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!token || token.includes('your-telegram') || token.length < 20) return '';
    return token;
  })(),
  telegramWebAppUrl: process.env.TELEGRAM_WEBAPP_URL || 'http://localhost:5173',
  adminTelegramChatId: process.env.ADMIN_TELEGRAM_CHAT_ID || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
