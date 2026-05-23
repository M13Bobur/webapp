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

  const webAppKeyboard = Markup.keyboard([
    [Markup.button.webApp('🍽 Menyuni ochish', env.telegramWebAppUrl)],
    [Markup.button.contactRequest('📱 Telefon raqamni ulashish')],
  ]).resize();

  const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🛒 Buyurtma berish', env.telegramWebAppUrl)],
    [Markup.button.callback('📋 Menyu', 'menu')],
  ]);

  bot.start(async (ctx) => {
    const user = ctx.from;
    const existing = await customerService.saveTelegramCustomer({
      telegramId: user.id,
      chatId: ctx.chat.id,
      fullname: [user.first_name, user.last_name].filter(Boolean).join(' '),
      username: user.username || '',
      phone: '',
    });

    const welcomeText = existing.phone
      ? `Assalomu alaykum, ${user.first_name}! 👋\n\nFaiza Cafe ga xush kelibsiz! Buyurtma berish uchun menyuni oching.`
      : `Assalomu alaykum, ${user.first_name}! 👋\n\nFaiza Cafe ga xush kelibsiz!\n\nBuyurtma berish uchun telefon raqamingizni ulashing.`;

    await ctx.reply(welcomeText, existing.phone ? startKeyboard : webAppKeyboard);
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

    await ctx.reply(
      '✅ Telefon raqamingiz saqlandi!\n\nEndi menyuni ochib buyurtma berishingiz mumkin.',
      startKeyboard
    );
  });

  bot.action('menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('🍽 Menyuni ochish uchun tugmani bosing:', startKeyboard);
  });

  bot.command('menu', async (ctx) => {
    await ctx.reply('🍽 Faiza Cafe menyusi:', startKeyboard);
  });

  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  return bot;
};
