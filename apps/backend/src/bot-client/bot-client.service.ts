import { Injectable, Logger } from '@nestjs/common';
import { Telegram } from 'telegraf';

@Injectable()
export class BotClientService {
  private readonly logger = new Logger(BotClientService.name);
  private telegram: Telegram | null = null;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token && token !== 'YOUR_TELEGRAM_BOT_TOKEN' && !token.includes('1234567890:')) {
      try {
        this.telegram = new Telegram(token);
        this.logger.log('Telegram Bot Client initialized successfully');
      } catch (err) {
        this.logger.error('Failed to initialize Telegram Bot Client', err);
      }
    } else {
      this.logger.warn('TELEGRAM_BOT_TOKEN is missing, default, or dummy. Notifications will not be sent.');
    }
  }

  async sendNotification(telegramId: string, text: string): Promise<boolean> {
    if (!this.telegram) {
      this.logger.warn(`Cannot send notification to ${telegramId}: Bot client is not initialized`);
      return false;
    }
    try {
      await this.telegram.sendMessage(telegramId, text, { parse_mode: 'HTML' });
      this.logger.log(`Notification sent successfully to ${telegramId}`);
      return true;
    } catch (err) {
      this.logger.error(`Error sending message to ${telegramId}:`, err);
      return false;
    }
  }
}
