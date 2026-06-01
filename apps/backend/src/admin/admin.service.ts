import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourierService } from '../courier/courier.service';
import { BotClientService } from '../bot-client/bot-client.service';
import { Rank, MissionStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { 
  AdminLoginResponse, 
  AdminCouriersResponse, 
  AdminStatsResponse, 
  CSVImportPreviewItem, 
  CSVImportResult 
} from '../shared-types';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly courierService: CourierService,
    private readonly botClient: BotClientService,
  ) {}

  async login(username: string, passwordHash: string): Promise<AdminLoginResponse> {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });
    if (!admin) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    const matches = await bcrypt.compare(passwordHash, admin.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    const token = this.jwtService.sign({ sub: admin.id, username: admin.username });

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    };
  }

  async writeAudit(adminId: string, action: string, details: string) {
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        details,
      },
    });
  }

  async getCouriers(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    rank?: Rank;
  }): Promise<AdminCouriersResponse> {
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.CourierWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { telegramId: { contains: params.search, mode: 'insensitive' } },
        { username: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.rank) {
      where.rank = params.rank;
    }

    const orderDirection = params.sortOrder || 'desc';
    let orderBy: Prisma.CourierOrderByWithRelationInput = { registeredAt: orderDirection };

    if (params.sortBy) {
      if (params.sortBy === 'name') orderBy = { name: orderDirection };
      else if (params.sortBy === 'ordersCount') orderBy = { ordersCount: orderDirection };
      else if (params.sortBy === 'rating') orderBy = { rating: orderDirection };
      else if (params.sortBy === 'starMapProgress') orderBy = { starMapProgress: orderDirection };
    }

    const [couriers, total] = await Promise.all([
      this.prisma.courier.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          missions: {
            where: { status: MissionStatus.ACTIVE },
            take: 1,
          },
        },
      }),
      this.prisma.courier.count({ where }),
    ]);

    const mapped = couriers.map((c) => {
      const activeMission = c.missions[0];
      return {
        id: c.id,
        telegramId: c.telegramId,
        name: c.name,
        username: c.username || undefined,
        ordersCount: c.ordersCount,
        rating: c.rating,
        rank: c.rank as any,
        starMapProgress: c.starMapProgress,
        registeredAt: c.registeredAt.toISOString(),
        activeMissionStage: activeMission ? activeMission.stage : 0,
        activeMissionStatus: activeMission ? (activeMission.status as any) : 'COMPLETED',
      };
    });

    return { couriers: mapped, total };
  }

  async getCourierById(id: string) {
    const courier = await this.prisma.courier.findUnique({
      where: { id },
      include: {
        missions: { orderBy: { stage: 'asc' } },
        bonusHistory: { orderBy: { grantedAt: 'desc' } },
      },
    });

    if (!courier) {
      throw new NotFoundException('Курьер не найден');
    }

    return {
      ...courier,
      missions: courier.missions.map((m) => ({
        ...m,
        target: m.stage === 1 ? 20 : m.stage === 2 ? 40 : 60,
        reward: m.stage === 1 ? '500 ₽' : m.stage === 2 ? 'Powerbank' : '5000 ₽',
      })),
    };
  }

  async updateCourierOrders(adminId: string, id: string, data: { ordersCount?: number; rating?: number; name?: string }) {
    const courier = await this.prisma.courier.findUnique({ where: { id } });
    if (!courier) {
      throw new NotFoundException('Курьер не найден');
    }

    const currentOrders = courier.ordersCount;
    const nextOrders = data.ordersCount !== undefined ? data.ordersCount : currentOrders;
    const addedOrders = Math.max(0, nextOrders - currentOrders);

    const updated = await this.prisma.courier.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : courier.name,
        ordersCount: nextOrders,
        rating: data.rating !== undefined ? data.rating : courier.rating,
      },
    });

    // Re-evaluate missions and rankings
    await this.courierService.evaluateCourierMissionsAndRanks(id, addedOrders);

    await this.writeAudit(
      adminId,
      'UPDATE_COURIER_ORDERS',
      `Обновлен курьер ${courier.name} (${courier.telegramId}). Заказы: ${currentOrders} -> ${nextOrders}. Рейтинг: ${courier.rating} -> ${data.rating ?? courier.rating}`
    );

    return this.getCourierById(id);
  }

  async overrideMissionStage(adminId: string, courierId: string, stage: number, status: MissionStatus, progress: number) {
    const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
    if (!courier) throw new NotFoundException('Курьер не найден');

    const mission = await this.prisma.missionStage.upsert({
      where: { courierId_stage: { courierId, stage } },
      update: { status, progress },
      create: { courierId, stage, status, progress },
    });

    await this.writeAudit(
      adminId,
      'OVERRIDE_MISSION_STAGE',
      `Изменен этап миссии ${stage} для курьера ${courier.name} (${courier.telegramId}). Статус: ${status}, Прогресс: ${progress}`
    );

    // If marked as COMPLETED, also verify if reward history needs updating
    if (status === MissionStatus.COMPLETED) {
      const type = `MISSION_${stage}`;
      const amount = stage === 1 ? '500 ₽' : stage === 2 ? 'Powerbank' : '5000 ₽';
      
      const existingBonus = await this.prisma.bonusHistory.findFirst({
        where: { courierId, type }
      });

      if (!existingBonus) {
        await this.prisma.bonusHistory.create({
          data: { courierId, type, amount }
        });
      }
    }

    return mission;
  }

  async resetMissionStage(adminId: string, courierId: string, stage: number) {
    const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
    if (!courier) throw new NotFoundException('Курьер не найден');

    await this.prisma.missionStage.update({
      where: { courierId_stage: { courierId, stage } },
      data: { status: stage === 1 ? MissionStatus.ACTIVE : MissionStatus.LOCKED, progress: 0 }
    });

    await this.prisma.bonusHistory.deleteMany({
      where: { courierId, type: `MISSION_${stage}` }
    });

    await this.writeAudit(
      adminId,
      'RESET_MISSION_STAGE',
      `Сброшена миссия ${stage} для курьера ${courier.name} (${courier.telegramId})`
    );

    return { success: true };
  }

  async grantStarMapBonus(adminId: string, courierId: string) {
    const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
    if (!courier) throw new NotFoundException('Курьер не найден');

    if (courier.starMapProgress < 80) {
      throw new BadRequestException('Недостаточно заказов на Звездной карте (требуется 80)');
    }

    // Add to bonus history
    await this.prisma.bonusHistory.create({
      data: {
        courierId,
        type: 'STAR_MAP',
        amount: '2000 ₽',
      },
    });

    // Reset progress indicator
    await this.prisma.courier.update({
      where: { id: courierId },
      data: { starMapProgress: 0 },
    });

    await this.prisma.notification.create({
      data: {
        courierId,
        title: 'Выплата за Звездную карту! ⭐',
        message: 'Администратор подтвердил вашу выплату за Звездную карту в размере 2000 ₽! Счетчик сброшен.',
        type: 'BONUS_REWARD',
      },
    });

    await this.botClient.sendNotification(
      courier.telegramId,
      '⭐ <b>Бонус по Звездной карте выплачен!</b>\n\nАдминистратор одобрил вашу выплату в размере 2000 ₽. Прогресс Звездной карты сброшен для новой цели!'
    );

    await this.writeAudit(
      adminId,
      'GRANT_STARMAP_BONUS',
      `Выдан бонус по Звездной карте для ${courier.name} (${courier.telegramId}) и сброшен прогресс.`
    );

    return this.getCourierById(courierId);
  }

  async importCSV(adminId: string, csvText: string): Promise<CSVImportResult> {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      throw new BadRequestException('CSV файл пуст или содержит только заголовки');
    }

    // Header validation (telegram_id,orders_count,date)
    const header = lines[0].toLowerCase();
    if (!header.includes('telegram_id') || !header.includes('orders_count')) {
      throw new BadRequestException('Неверный формат заголовков CSV (требуется: telegram_id,orders_count,date)');
    }

    const successItems: { tgId: string; count: number }[] = [];
    const errors: string[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map(c => c.trim());
      if (cols.length < 2) {
        errors.push(`Строка ${i + 1}: Недостаточно колонок (${line})`);
        continue;
      }

      const tgId = cols[0];
      const countVal = Number(cols[1]);

      if (!tgId) {
        errors.push(`Строка ${i + 1}: Пропущен telegram_id`);
        continue;
      }

      if (isNaN(countVal) || countVal < 0) {
        errors.push(`Строка ${i + 1}: Неверное количество заказов (${cols[1]})`);
        continue;
      }

      successItems.push({ tgId, count: countVal });
    }

    let successCount = 0;

    for (const item of successItems) {
      try {
        let courier = await this.prisma.courier.findUnique({
          where: { telegramId: item.tgId },
        });

        if (!courier) {
          // Find or create
          courier = await this.prisma.courier.create({
            data: {
              telegramId: item.tgId,
              name: `Водитель #${item.tgId}`,
              ordersCount: item.count,
              rating: 5.0,
              rank: Rank.CADET,
              starMapProgress: item.count,
              missions: {
                createMany: {
                  data: [
                    { stage: 1, status: MissionStatus.ACTIVE, progress: 0 },
                    { stage: 2, status: MissionStatus.LOCKED, progress: 0 },
                    { stage: 3, status: MissionStatus.LOCKED, progress: 0 },
                  ]
                }
              }
            },
          });
          
          await this.courierService.evaluateCourierMissionsAndRanks(courier.id, item.count);
        } else {
          const nextOrders = courier.ordersCount + item.count;
          await this.prisma.courier.update({
            where: { id: courier.id },
            data: { ordersCount: nextOrders },
          });

          await this.courierService.evaluateCourierMissionsAndRanks(courier.id, item.count);
        }
        successCount++;
      } catch (err: any) {
        errors.push(`Ошибка импорта для telegram_id ${item.tgId}: ${err.message}`);
      }
    }

    await this.writeAudit(
      adminId,
      'IMPORT_CSV',
      `Импортировано водителей: ${successCount}. Ошибок: ${errors.length}`
    );

    return {
      successCount,
      failedCount: errors.length,
      errors,
    };
  }

  async getStats(): Promise<AdminStatsResponse> {
    const [totalCouriers, orderAgg, ratingAgg, activeMissions, completedMissions, bonusCount] = await Promise.all([
      this.prisma.courier.count(),
      this.prisma.courier.aggregate({ _sum: { ordersCount: true } }),
      this.prisma.courier.aggregate({ _avg: { rating: true } }),
      this.prisma.missionStage.count({ where: { status: MissionStatus.ACTIVE } }),
      this.prisma.missionStage.count({ where: { status: MissionStatus.COMPLETED } }),
      this.prisma.bonusHistory.count(),
    ]);

    return {
      totalCouriers,
      totalOrders: orderAgg._sum.ordersCount || 0,
      averageRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 100) / 100 : 5.0,
      activeMissionsCount: activeMissions,
      completedMissionsCount: completedMissions,
      totalBonusesPaid: bonusCount,
    };
  }

  async getAuditLogs() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { username: true } } },
      take: 100,
    });

    return logs.map((l) => ({
      id: l.id,
      adminId: l.adminId,
      adminUsername: l.admin.username,
      action: l.action,
      details: l.details,
      createdAt: l.createdAt.toISOString(),
    }));
  }
}
