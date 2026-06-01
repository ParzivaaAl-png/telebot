import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { CourierService } from './courier.service';
import { TgAuthGuard } from '../auth/tg-auth.guard';
import { ApiTags, ApiHeader, ApiOperation } from '@nestjs/swagger';

@ApiTags('Driver API')
@UseGuards(TgAuthGuard)
@ApiHeader({
  name: 'x-telegram-init-data',
  description: 'Telegram WebApp initData query string',
  required: true,
})
@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current courier profile and rank progress' })
  async getMe(@Req() req: any) {
    return this.courierService.getMe(req.courier.id);
  }

  @Get('me/missions')
  @ApiOperation({ summary: 'Get current courier RPG missions tree stage details' })
  async getMissions(@Req() req: any) {
    return this.courierService.getMissions(req.courier.id);
  }

  @Get('me/starmap')
  @ApiOperation({ summary: 'Get courier Star Map progress, remaining orders, and history' })
  async getStarMap(@Req() req: any) {
    return this.courierService.getStarMap(req.courier.id);
  }

  @Get('me/notifications')
  @ApiOperation({ summary: 'Get courier notification feed' })
  async getNotifications(@Req() req: any) {
    return this.courierService.getNotifications(req.courier.id);
  }

  @Post('me/notifications/read')
  @ApiOperation({ summary: 'Mark all notifications in the feed as read' })
  async readNotifications(@Req() req: any) {
    return this.courierService.readNotifications(req.courier.id);
  }
}
