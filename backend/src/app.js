import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, '../../frontend/dist');
const hasFrontendBuild = fs.existsSync(path.join(frontendDist, 'index.html'));

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
    })
  );
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: hasFrontendBuild ? false : undefined,
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests' },
    skip: (req) => req.method === 'OPTIONS',
  });
  app.use('/api', limiter);

  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());

  app.use('/uploads', express.static(path.join(__dirname, '../', env.uploadDir)));

  // API
  app.use('/api', routes);

  // Frontend build (Telegram Web App — / ochilganda)
  if (hasFrontendBuild) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Faiza Cafe API',
        hint: 'Frontend build topilmadi. cd frontend && npm run build',
        health: '/api/health',
      });
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
