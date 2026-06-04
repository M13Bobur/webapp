import { Telegraf, Markup } from 'telegraf';
import { env } from '../config/env.js';
import * as customerService from '../services/customer.service.js';
import { setBotInstance } from '../services/notification.service.js';

export const initBot = () => {
  if (!env.telegramBotToken) {
    console.warn('TELEGRAM_BOT_TOKEN not set — bot disabled');
    return null;
  }

  const bot = new Telegraf(env.telegramBotToken);
  setBotInstance(bot);

  const phoneKeyboard = Markup.keyboard([
    [Markup.button.contactRequest('📱 Telefon raqamni ulashish')],
  ]).resize();

  const orderKeyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🛒 Buyurtma berish', env.telegramWebAppUrl)],
  ]);

  bot.start(async (ctx) => {
    const user = ctx.from;
    const existing = await customerService.saveTelegramCustomer({
      telegramId: user.id,
      chatId: ctx.chat.id,
      fullname: [user.first_name, user.last_name].filter(Boolean).join(' '),
      username: user.username || '',
    });

    const welcomeText = existing.phone
      ? `Assalomu alaykum, ${user.first_name}! 👋\n\nFaiza Cafe ga xush kelibsiz! Buyurtma berish uchun tugmani bosing.`
      : `Assalomu alaykum, ${user.first_name}! 👋\n\nFaiza Cafe ga xush kelibsiz!\n\nBuyurtma berish uchun telefon raqamingizni ulashing.`;

    if (existing.phone) {
      await ctx.reply(welcomeText, {
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: orderKeyboard.reply_markup.inline_keyboard,
        },
      });
    } else {
      await ctx.reply(welcomeText, phoneKeyboard);
    }
  });

  bot.on('contact', async (ctx) => {
    const contact = ctx.message.contact;
    if (String(contact.user_id) !== String(ctx.from.id)) {
      return ctx.reply('Iltimos, o\'zingizning telefon raqamingizni ulashing.');
    }

    await customerService.saveTelegramCustomer({
      telegramId: ctx.from.id,
      chatId: ctx.chat.id,
      fullname: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' '),
      username: ctx.from.username || '',
      phone: contact.phone_number,
    });

    await ctx.reply('✅ Telefon raqamingiz saqlandi!', Markup.removeKeyboard());
    await ctx.reply('Endi buyurtma berishingiz mumkin:', orderKeyboard);
  });

  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  return bot;
};

export const configureBotMenuButton = async (bot) => {
  if (!env.telegramWebAppUrl) return;
  await bot.telegram.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: '🛒 Buyurtma berish',
      web_app: { url: env.telegramWebAppUrl },
    },
  });
};
