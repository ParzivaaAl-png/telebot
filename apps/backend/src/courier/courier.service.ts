import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BotClientService } from '../bot-client/bot-client.service';
import { Rank, MissionStatus, Courier, MissionStage, BonusHistory, Notification } from '@prisma/client';
import { 
  CourierMeResponse, 
  CourierMissionsResponse, 
  CourierStarMapResponse, 
  CourierNotificationsResponse 
} from '@atlas-fleet/shared-types';

@Injectable()
export class CourierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botClient: BotClientService,
  ) {}

  getRank(ordersCount: number): Rank {
    if (ordersCount <= 100) return Rank.CADET;
    if (ordersCount <= 300) return Rank.NAVIGATOR;
    if (ordersCount <= 600) return Rank.PILOT;
    return Rank.COMMANDER;
  }

  getNextRankInfo(ordersCount: number): { nextRank: Rank | null; ordersToNext: number } {
    if (ordersCount <= 100) {
      return { nextRank: Rank.NAVIGATOR, ordersToNext: 101 - ordersCount };
    }
    if (ordersCount <= 300) {
      return { nextRank: Rank.PILOT, ordersToNext: 301 - ordersCount };
    }
    if (ordersCount <= 600) {
      return { nextRank: Rank.COMMANDER, ordersToNext: 601 - ordersCount };
    }
    return { nextRank: null, ordersToNext: 0 };
  }

  async getMe(courierId: string): Promise<CourierMeResponse> {
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
    });
    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    const { nextRank, ordersToNext } = this.getNextRankInfo(courier.ordersCount);

    return {
      courier: {
        id: courier.id,
        telegramId: courier.telegramId,
        name: courier.name,
        username: courier.username || undefined,
        ordersCount: courier.ordersCount,
        rating: courier.rating,
        rank: courier.rank,
        starMapProgress: courier.starMapProgress,
        registeredAt: courier.registeredAt.toISOString(),
      },
      nextRank,
      ordersToNextRank: ordersToNext,
    };
  }

  async getMissions(courierId: string): Promise<CourierMissionsResponse> {
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
      include: { missions: true },
    });
    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    // Ensure all 3 mission stages exist
    const stages = [1, 2, 3];
    const missionsList: MissionStage[] = [];

    for (const stageNum of stages) {
      let m = courier.missions.find((x) => x.stage === stageNum);
      if (!m) {
        m = await this.prisma.missionStage.create({
          data: {
            courierId,
            stage: stageNum,
            status: stageNum === 1 ? MissionStatus.ACTIVE : MissionStatus.LOCKED,
            progress: 0,
          },
        });
      }
      missionsList.push(m);
    }

    // Map DB status to shared types
    const mappedMissions = missionsList.map((m) => {
      let target = 20;
      let reward = '500 ₽';
      let deadlineDays: number | undefined;
      let minRating: number | undefined;

      if (m.stage === 2) {
        target = 40;
        reward = 'Powerbank';
        deadlineDays = 4;
      } else if (m.stage === 3) {
        target = 60;
        reward = '5000 ₽';
        deadlineDays = 7;
        minRating = 4.8;
      }

      return {
        id: m.id,
        courierId: m.courierId,
        stage: m.stage,
        status: m.status as any,
        progress: m.progress,
        target,
        reward,
        deadlineDays,
        minRating,
        updatedAt: m.updatedAt.toISOString(),
      };
    });

    return { missions: mappedMissions };
  }

  async getStarMap(courierId: string): Promise<CourierStarMapResponse> {
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
      include: {
        bonusHistory: {
          where: { type: 'STAR_MAP' },
          orderBy: { grantedAt: 'desc' },
        },
      },
    });
    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    const target = 80;
    const remaining = Math.max(0, target - courier.starMapProgress);

    const history = courier.bonusHistory.map((b) => ({
      id: b.id,
      courierId: b.courierId,
      type: b.type,
      amount: b.amount,
      grantedAt: b.grantedAt.toISOString(),
    }));

    return {
      progress: courier.starMapProgress,
      target,
      reward: '2000 ₽',
      remaining,
      history,
    };
  }

  async getNotifications(courierId: string): Promise<CourierNotificationsResponse> {
    const notifications = await this.prisma.notification.findMany({
      where: { courierId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        courierId: n.courierId,
        title: n.title,
        message: n.message,
        type: n.type as any,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  async readNotifications(courierId: string): Promise<{ success: boolean }> {
    await this.prisma.notification.updateMany({
      where: { courierId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  // Internal trigger to calculate missions progress & trigger completions
  async evaluateCourierMissionsAndRanks(courierId: string, addedOrders: number = 0) {
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
      include: { missions: true },
    });
    if (!courier) return;

    // 1. Calculate & Update Rank
    const newRank = this.getRank(courier.ordersCount);
    if (newRank !== courier.rank) {
      await this.prisma.courier.update({
        where: { id: courierId },
        data: { rank: newRank },
      });
      
      await this.prisma.notification.create({
        data: {
          courierId,
          title: `Новое звание: ${newRank}! 🚀`,
          message: `Ваш ранг повышен до ${newRank}! Ваши космические привилегии расширились.`,
          type: 'MISSION_UNLOCKED',
        },
      });

      await this.botClient.sendNotification(
        courier.telegramId,
        `🚀 <b>Повышение звания!</b>\n\nПоздравляем! Ваш ранг повышен до <b>${newRank}</b>. Продолжайте полеты во Вселенной Atlas Fleet!`
      );
    }

    // 2. Increment Star Map Progress (it is updated by added orders up to 80)
    if (addedOrders > 0 && courier.starMapProgress < 80) {
      const newStarMapProgress = Math.min(80, courier.starMapProgress + addedOrders);
      await this.prisma.courier.update({
        where: { id: courierId },
        data: { starMapProgress: newStarMapProgress },
      });

      if (newStarMapProgress >= 80 && courier.starMapProgress < 80) {
        // Just crossed 80 orders, grant bonus eligible status
        await this.prisma.notification.create({
          data: {
            courierId,
            title: 'Звездная карта завершена! ⭐',
            message: 'Вы выполнили цель в 80 заказов по Звездной карте! Бонус 2000 ₽ доступен к выплате. Ожидайте подтверждения администратора.',
            type: 'BONUS_REWARD',
          },
        });

        await this.botClient.sendNotification(
          courier.telegramId,
          '⭐ <b>Звездная карта заполнена!</b>\n\nВы совершили 80 прыжков (заказов) и заполнили карту. Бонус в размере 2000 ₽ отправлен на рассмотрение администрации!'
        );
      }
    }

    // 3. Evaluate first flight mission tree
    const now = new Date();
    const daysSinceReg = (now.getTime() - new Date(courier.registeredAt).getTime()) / (1000 * 60 * 60 * 24);

    // Ensure missions exist in DB
    await this.getMissions(courierId);
    const freshCourier = await this.prisma.courier.findUnique({
      where: { id: courierId },
      include: { missions: true },
    });
    if (!freshCourier) return;

    // Mission 1: 20 orders
    const m1 = freshCourier.missions.find((x) => x.stage === 1);
    if (m1 && m1.status === MissionStatus.ACTIVE) {
      const progress = Math.min(freshCourier.ordersCount, 20);
      if (progress >= 20) {
        await this.prisma.missionStage.update({
          where: { id: m1.id },
          data: { status: MissionStatus.COMPLETED, progress: 20 },
        });

        await this.prisma.missionStage.update({
          where: { courierId_stage: { courierId, stage: 2 } },
          data: { status: MissionStatus.ACTIVE, progress: Math.min(freshCourier.ordersCount, 40) },
        });

        await this.prisma.bonusHistory.create({
          data: { courierId, type: 'MISSION_1', amount: '500 ₽' },
        });

        await this.prisma.notification.create({
          data: {
            courierId,
            title: 'Миссия 1 выполнена! ☄️',
            message: 'Миссия "Первый полет: Старт" выполнена! Получена награда: 500 ₽.',
            type: 'MISSION_COMPLETE',
          },
        });

        await this.botClient.sendNotification(
          freshCourier.telegramId,
          '☄️ <b>Миссия 1 Выполнена!</b>\n\nВы выполнили 20 заказов и получили 500 ₽!\nРазблокирована Миссия 2: 40 заказов за 4 дня.'
        );
      } else {
        await this.prisma.missionStage.update({
          where: { id: m1.id },
          data: { progress },
        });
      }
    }

    // Reload courier for M2
    const freshCourierM2 = await this.prisma.courier.findUnique({
      where: { id: courierId },
      include: { missions: true },
    });
    if (!freshCourierM2) return;

    // Mission 2: 40 orders in 4 days
    const m2 = freshCourierM2.missions.find((x) => x.stage === 2);
    if (m2 && m2.status === MissionStatus.ACTIVE) {
      if (daysSinceReg > 4) {
        // Expired, remain ACTIVE but show expired or switch status to LOCKED
        // We will lock it as per TZ
        await this.prisma.missionStage.update({
          where: { id: m2.id },
          data: { status: MissionStatus.LOCKED },
        });
      } else {
        const progress = Math.min(freshCourierM2.ordersCount, 40);
        if (progress >= 40) {
          await this.prisma.missionStage.update({
            where: { id: m2.id },
            data: { status: MissionStatus.COMPLETED, progress: 40 },
          });

          await this.prisma.missionStage.update({
            where: { courierId_stage: { courierId, stage: 3 } },
            data: { status: MissionStatus.ACTIVE, progress: Math.min(freshCourierM2.ordersCount, 60) },
          });

          await this.prisma.bonusHistory.create({
            data: { courierId, type: 'MISSION_2', amount: 'Powerbank' },
          });

          await this.prisma.notification.create({
            data: {
              courierId,
              title: 'Миссия 2 выполнена! 🔋',
              message: 'Миссия "Первый полет: Скорость" выполнена в срок! Получена награда: Powerbank.',
              type: 'MISSION_COMPLETE',
          },
          });

          await this.botClient.sendNotification(
            freshCourierM2.telegramId,
            '🔋 <b>Миссия 2 Выполнена!</b>\n\nВы сделали 40 заказов быстрее чем за 4 дня! Награда Powerbank уже ждет вас в офисе Atlas Fleet.\nРазблокирована Миссия 3: 60 заказов за неделю с рейтингом >= 4.8.'
          );
        } else {
          await this.prisma.missionStage.update({
            where: { id: m2.id },
            data: { progress },
          });
        }
      }
    }

    // Reload courier for M3
    const freshCourierM3 = await this.prisma.courier.findUnique({
      where: { id: courierId },
      include: { missions: true },
    });
    if (!freshCourierM3) return;

    // Mission 3: 60 orders in 7 days, rating >= 4.8
    const m3 = freshCourierM3.missions.find((x) => x.stage === 3);
    if (m3 && m3.status === MissionStatus.ACTIVE) {
      if (daysSinceReg > 7) {
        await this.prisma.missionStage.update({
          where: { id: m3.id },
          data: { status: MissionStatus.LOCKED },
        });
      } else {
        const progress = Math.min(freshCourierM3.ordersCount, 60);
        if (progress >= 60 && freshCourierM3.rating >= 4.8) {
          await this.prisma.missionStage.update({
            where: { id: m3.id },
            data: { status: MissionStatus.COMPLETED, progress: 60 },
          });

          await this.prisma.bonusHistory.create({
            data: { courierId, type: 'MISSION_3', amount: '5000 ₽' },
          });

          await this.prisma.notification.create({
            data: {
              courierId,
              title: 'Миссия 3 выполнена! 🏆',
              message: 'Миссия "Первый полет: Мастерство" выполнена! Получена супернаграда: 5000 ₽.',
              type: 'MISSION_COMPLETE',
            },
          });

          await this.botClient.sendNotification(
            freshCourierM3.telegramId,
            '🏆 <b>Миссия 3 Выполнена!</b>\n\nФантастический результат! Вы сделали 60 заказов за неделю с отличным рейтингом и заработали суперприз 5000 ₽!'
          );
        } else {
          await this.prisma.missionStage.update({
            where: { id: m3.id },
            data: { progress },
          });
        }
      }
    }
  }
}
