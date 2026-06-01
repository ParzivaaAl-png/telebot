import { Module, Global } from '@nestjs/common';
import { BotClientService } from './bot-client.service';

@Global()
@Module({
  providers: [BotClientService],
  exports: [BotClientService],
})
export class BotClientModule {}
