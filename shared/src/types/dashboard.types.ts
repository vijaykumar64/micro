export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface UserStats {
  totalLogins: number;
  totalUploads: number;
  totalProfileUpdates: number;
  recentActivity: ActivityLog[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsersLast30Days: number;
  totalUploads: number;
  totalLogins: number;
}
