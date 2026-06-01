import { Telegraf, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN' || token.includes('1234567890:')) {
  console.warn('TELEGRAM_BOT_TOKEN is missing, default, or dummy. Bot will not start.');
  process.exit(0);
}

const bot = new Telegraf(token);
const prisma = new PrismaClient();
const miniappUrl = process.env.FRONTEND_MINIAPP_URL || 'http://localhost:5173';

bot.start(async (ctx) => {
  const name = ctx.from.first_name || 'Пилот';
  const welcomeText = `🚀 <b>Добро пожаловать в Atlas Fleet, ${name}!</b>\n\n` +
    `Мы подготовили для вас космическую систему мотивации водителей.\n` +
    `Выполняйте миссии, повышайте свой ранг и открывайте новые бонусы по Звездной карте!\n\n` +
    `Нажмите кнопку ниже, чтобы запустить приложение и начать свой первый полет.`;

  await ctx.replyWithHTML(
    welcomeText,
    Markup.inlineKeyboard([
      [Markup.button.webApp('Запустить Atlas Fleet 🌌', miniappUrl)]
    ])
  );
});

bot.command('profile', async (ctx) => {
  const tgId = ctx.from.id.toString();
  
  try {
    const courier = await prisma.courier.findUnique({
      where: { telegramId: tgId },
    });

    if (!courier) {
      await ctx.replyWithHTML(
        `❌ <b>Досье не найдено</b>\n\nВы еще не зарегистрированы в Atlas Fleet. Пожалуйста, откройте Mini App для автоматической регистрации!`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('Запустить Atlas Fleet 🌌', miniappUrl)]
        ])
      );
      return;
    }

    const rankEmojis: Record<string, string> = {
      CADET: '🛩️ Cadet',
      NAVIGATOR: '🛰️ Navigator',
      PILOT: '🚀 Pilot',
      COMMANDER: '🛸 Commander'
    };

    const rankText = rankEmojis[courier.rank] || courier.rank;

    const profileText = `👨‍🚀 <b>Космическое досье: ${courier.name}</b>\n\n` +
      `🪐 <b>Текущий ранг:</b> ${rankText}\n` +
      `📦 <b>Выполнено заказов:</b> ${courier.ordersCount}\n` +
      `⭐ <b>Рейтинг:</b> ${courier.rating.toFixed(2)}\n` +
      `🗺️ <b>Прогресс Звездной карты:</b> ${courier.starMapProgress} / 80 заказов\n\n` +
      `Желаем успешного полета во Вселенной Atlas Fleet!`;

    await ctx.replyWithHTML(profileText);
  } catch (err) {
    console.error('Error fetching profile in bot:', err);
    await ctx.reply('Произошла ошибка при загрузке профиля. Пожалуйста, попробуйте позже.');
  }
});

bot.launch()
  .then(() => console.log('Telegram Bot successfully launched!'))
  .catch((err) => console.error('Failed to launch Telegram Bot:', err));

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  prisma.$disconnect();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  prisma.$disconnect();
});
