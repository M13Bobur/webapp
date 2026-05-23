import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { normalizePhone } from '../utils/phone.js';

export const loginAdmin = async (phone, password) => {
  const normalized = normalizePhone(phone);
  const admin = await Admin.findOne({ phone: normalized }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    throw new AppError('Telefon yoki parol noto\'g\'ri', 401);
  }

  const token = jwt.sign({ id: admin._id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return {
    token,
    admin: { id: admin._id, phone: admin.phone, name: admin.name },
  };
};

export const ensureDefaultAdmin = async () => {
  const phone = normalizePhone(env.adminPhone);

  const existing = await Admin.findOne({ phone });
  if (existing) return;

  const legacy = await Admin.findOne({ phone: { $exists: false } });
  if (legacy) {
    legacy.phone = phone;
    legacy.password = env.adminPassword;
    await legacy.save();
    await Admin.collection.updateOne({ _id: legacy._id }, { $unset: { email: 1 } });
    console.log(`Admin telefon raqamiga yangilandi: ${phone}`);
    return;
  }

  const anyAdmin = await Admin.findOne();
  if (!anyAdmin) {
    await Admin.create({
      phone,
      password: env.adminPassword,
      name: 'Super Admin',
    });
    console.log(`Default admin yaratildi: ${phone}`);
  }
};
