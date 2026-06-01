import { Telegraf, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as path from 'path';

// Support loading from root .env in monorepo setup
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN' || token.includes('1234567890:')) {
  console.warn('TELEGRAM_BOT_TOKEN is missing, default, or dummy. Bot will not start.');
  process.exit(0);
}

const bot = new Telegraf(token);
const prisma = new PrismaClient();
const miniappUrl = process.env.FRONTEND_MINIAPP_URL || 'https://frontend-miniapp-eight.vercel.app';

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

// On Render, PORT is injected automatically. Locally, we use 8080 to avoid conflicts with backend PORT (3000)
const port = process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : 8080;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
}).listen(port, () => {
  console.log(`Health check HTTP server is listening on port ${port}`);
});

async function launchBotWithRetry(retries = 30, delayMs = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Launching Telegram Bot (attempt ${i + 1}/${retries})...`);
      await bot.launch();
      console.log('Telegram Bot successfully launched!');
      return;
    } catch (err: any) {
      console.error(`Failed to launch Telegram Bot on attempt ${i + 1}:`, err.message || err);
      if (i === retries - 1) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying launch in ${delayMs / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

launchBotWithRetry();

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  prisma.$disconnect();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  prisma.$disconnect();
});
