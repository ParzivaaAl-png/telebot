import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Rank, MissionStatus } from '@prisma/client';

@ApiTags('Admin API')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() body: { username: string; passwordHash: string }) {
    return this.adminService.login(body.username, body.passwordHash);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('couriers')
  @ApiOperation({ summary: 'Get list of couriers with pagination, filtering, and search' })
  async getCouriers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('rank') rank?: Rank,
  ) {
    return this.adminService.getCouriers({ page, limit, search, sortBy, sortOrder, rank });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('couriers/:id')
  @ApiOperation({ summary: 'Get single courier details' })
  async getCourierById(@Param('id') id: string) {
    return this.adminService.getCourierById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('couriers/:id/orders')
  @ApiOperation({ summary: 'Update orders and rating for courier' })
  async updateOrders(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { ordersCount?: number; rating?: number; name?: string },
  ) {
    return this.adminService.updateCourierOrders(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('couriers/import')
  @ApiOperation({ summary: 'Import CSV data' })
  async importCSV(@Req() req: any, @Body() body: { csvText: string }) {
    return this.adminService.importCSV(req.user.id, body.csvText);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('couriers/:id/missions/stage')
  @ApiOperation({ summary: 'Override mission stage details' })
  async overrideStage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { stage: number; status: MissionStatus; progress: number },
  ) {
    return this.adminService.overrideMissionStage(req.user.id, id, body.stage, body.status, body.progress);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('couriers/:id/missions/stage')
  @ApiOperation({ summary: 'Reset mission stage details' })
  async resetStage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { stage: number },
  ) {
    return this.adminService.resetMissionStage(req.user.id, id, body.stage);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('couriers/:id/starmap/bonus')
  @ApiOperation({ summary: 'Trigger Star Map bonus payout and reset progress' })
  async grantStarMapBonus(@Req() req: any, @Param('id') id: string) {
    return this.adminService.grantStarMapBonus(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('logs')
  @ApiOperation({ summary: 'Get operational audit logs' })
  async getLogs() {
    return this.adminService.getAuditLogs();
  }
}
