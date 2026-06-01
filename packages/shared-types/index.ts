export type Rank = 'CADET' | 'NAVIGATOR' | 'PILOT' | 'COMMANDER';

export type MissionStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

export interface Courier {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  ordersCount: number;
  rating: number;
  rank: Rank;
  starMapProgress: number;
  registeredAt: string;
}

export interface MissionStage {
  id: string;
  courierId: string;
  stage: number;
  status: MissionStatus;
  progress: number; // e.g., current orders count towards this mission
  target: number; // e.g., 20, 40, or 60 orders
  reward: string; // e.g., "500 ₽", "Powerbank", "5000 ₽"
  deadlineDays?: number;
  minRating?: number;
  updatedAt: string;
}

export interface BonusHistory {
  id: string;
  courierId: string;
  type: string; // "MISSION_1", "MISSION_2", "MISSION_3", "STAR_MAP"
  amount: string;
  grantedAt: string;
}

export interface Notification {
  id: string;
  courierId: string;
  title: string;
  message: string;
  type: 'MISSION_COMPLETE' | 'MISSION_UNLOCKED' | 'BONUS_REWARD' | 'MISSION_EXPIRING' | 'ORDERS_LEFT';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  details: string;
  createdAt: string;
}

// API Responses
export interface CourierMeResponse {
  courier: Courier;
  nextRank: Rank | null;
  ordersToNextRank: number;
}

export interface CourierMissionsResponse {
  missions: MissionStage[];
}

export interface CourierStarMapResponse {
  progress: number;
  target: number; // e.g. 80
  reward: string; // e.g. "2000 ₽"
  remaining: number;
  history: BonusHistory[];
}

export interface CourierNotificationsResponse {
  notifications: Notification[];
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    username: string;
  };
}

export interface AdminCouriersResponse {
  couriers: (Courier & {
    activeMissionStage: number;
    activeMissionStatus: MissionStatus;
  })[];
  total: number;
}

export interface AdminStatsResponse {
  totalCouriers: number;
  totalOrders: number;
  averageRating: number;
  activeMissionsCount: number;
  completedMissionsCount: number;
  totalBonusesPaid: number; // calculated in rubles or count
}

export interface CSVImportPreviewItem {
  telegramId: string;
  ordersCount: number;
  date: string;
  isValid: boolean;
  errors: string[];
}

export interface CSVImportResult {
  successCount: number;
  failedCount: number;
  errors: string[];
}
