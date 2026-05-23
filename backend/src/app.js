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
const adminPanelDist = path.join(__dirname, '../../admin-panel/dist');
const hasAdminBuild = fs.existsSync(path.join(adminPanelDist, 'index.html'));

const isApiOrUploads = (reqPath) =>
  reqPath.startsWith('/api') || reqPath.startsWith('/uploads');

/** React SPA — barcha route lar index.html ga */
const serveSpa = (app, distPath) => {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (isApiOrUploads(req.path)) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
};

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
      contentSecurityPolicy: hasAdminBuild ? false : undefined,
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

  app.use('/api', routes);

  // http://localhost:5000 → admin-panel/dist
  if (hasAdminBuild) {
    serveSpa(app, adminPanelDist);
  } else {
    app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Faiza Cafe API',
        hint: 'Admin panel: cd admin-panel && npm run build',
        health: '/api/health',
      });
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
