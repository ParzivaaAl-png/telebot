import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { CourierModule } from '../courier/courier.module';

@Module({
  imports: [AuthModule, CourierModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
