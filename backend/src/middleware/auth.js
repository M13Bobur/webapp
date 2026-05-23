import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { Admin } from '../models/Admin.js';
import { validateTelegramWebAppData } from '../utils/telegramAuth.js';
import { Customer } from '../models/Customer.js';

export const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Not authorized', 401));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return next(new AppError('Not authorized', 401));
    }
    req.admin = admin;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const telegramWebAppAuth = async (req, res, next) => {
  const initData = req.headers['x-telegram-init-data'] || req.body?.initData;
  const telegramUser = validateTelegramWebAppData(initData);

  if (!telegramUser?.id) {
    return next(new AppError('Invalid Telegram authentication', 401));
  }

  const customer = await Customer.findOne({ telegramId: String(telegramUser.id) });
  if (!customer) {
    return next(new AppError('Customer not registered. Please start the bot first.', 401));
  }

  req.telegramUser = telegramUser;
  req.customer = customer;
  next();
};

export const optionalTelegramAuth = async (req, res, next) => {
  const initData = req.headers['x-telegram-init-data'];
  if (initData) {
    const telegramUser = validateTelegramWebAppData(initData);
    if (telegramUser?.id) {
      req.telegramUser = telegramUser;
      req.customer = await Customer.findOne({ telegramId: String(telegramUser.id) });
    }
  }
  next();
};
