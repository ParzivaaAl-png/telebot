import { PrismaClient, Rank, MissionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // admin
  const passwordHash = await bcrypt.hash('adminpassword123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
    },
  });
  console.log('Seeded admin:', admin.username);

  // courier 1
  await prisma.courier.upsert({
    where: { telegramId: '12345678' },
    update: {},
    create: {
      telegramId: '12345678',
      name: 'Gagarin Yuri',
      username: 'gagarin_yuri',
      ordersCount: 15,
      rating: 4.9,
      rank: Rank.CADET,
      starMapProgress: 15,
      missions: {
        createMany: {
          data: [
            { stage: 1, status: MissionStatus.ACTIVE, progress: 15 },
            { stage: 2, status: MissionStatus.LOCKED, progress: 0 },
            { stage: 3, status: MissionStatus.LOCKED, progress: 0 },
          ]
        }
      }
    }
  });

  // courier 2
  await prisma.courier.upsert({
    where: { telegramId: '87654321' },
    update: {},
    create: {
      telegramId: '87654321',
      name: 'Armstrong Neil',
      username: 'armstrong_neil',
      ordersCount: 125,
      rating: 4.85,
      rank: Rank.NAVIGATOR,
      starMapProgress: 45,
      missions: {
        createMany: {
          data: [
            { stage: 1, status: MissionStatus.COMPLETED, progress: 20 },
            { stage: 2, status: MissionStatus.COMPLETED, progress: 40 },
            { stage: 3, status: MissionStatus.ACTIVE, progress: 35 },
          ]
        }
      },
      bonusHistory: {
        createMany: {
          data: [
            { type: 'MISSION_1', amount: '500 ₽' },
            { type: 'MISSION_2', amount: 'Powerbank' },
          ]
        }
      }
    }
  });

  console.log('Seeded test couriers');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
