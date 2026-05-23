import { env } from '../config/env.js';

let botInstance = null;
let ioInstance = null;

export const setBotInstance = (bot) => {
  botInstance = bot;
};

export const setIoInstance = (io) => {
  ioInstance = io;
};

const statusMessages = {
  pending: '🆕 Yangi buyurtma qabul qilindi',
  accepted: '✅ Buyurtmangiz qabul qilindi',
  preparing: '👨‍🍳 Buyurtmangiz tayyorlanmoqda',
  delivering: '🚗 Buyurtmangiz yetkazilmoqda',
  completed: '🎉 Buyurtmangiz yetkazildi! Rahmat!',
  cancelled: '❌ Buyurtmangiz bekor qilindi',
};

export const notifyCustomerOrder = async (customer, order, status) => {
  if (!botInstance || !customer?.chatId) return;

  const message = statusMessages[status] || statusMessages.pending;
  const text = `${message}\n\n📦 Buyurtma: ${order.orderNumber}\n💰 Jami: ${order.totalPrice.toLocaleString()} so'm\n📊 Holat: ${order.status}`;

  try {
    await botInstance.telegram.sendMessage(customer.chatId, text);
  } catch (err) {
    console.error('Failed to notify customer:', err.message);
  }
};

export const notifyAdminNewOrder = async (order, customer) => {
  if (!botInstance || !env.adminTelegramChatId) return;

  const items = order.items.map((i) => `• ${i.title} x${i.quantity}`).join('\n');
  const text = `🆕 YANGI BUYURTMA\n\n📦 ${order.orderNumber}\n👤 ${customer?.fullname || customer?.phone}\n📞 ${order.phone}\n\n${items}\n\n💰 ${order.totalPrice.toLocaleString()} so'm`;

  try {
    await botInstance.telegram.sendMessage(env.adminTelegramChatId, text);
  } catch (err) {
    console.error('Failed to notify admin:', err.message);
  }
};

export const emitOrderUpdate = (order) => {
  if (ioInstance) {
    ioInstance.emit('order:updated', order);
    ioInstance.emit('order:new', order);
  }
};
