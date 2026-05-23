import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    chatId: { type: String, required: true },
    fullname: { type: String, default: '' },
    username: { type: String, default: '' },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

export const Customer = mongoose.model('Customer', customerSchema);
