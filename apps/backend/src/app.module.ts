import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CourierModule } from './courier/courier.module';
import { AdminModule } from './admin/admin.module';
import { BotClientModule } from './bot-client/bot-client.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CourierModule,
    AdminModule,
    BotClientModule,
  ],
})
export class AppModule {}
