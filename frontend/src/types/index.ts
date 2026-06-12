export type UserRole = 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  userId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown> | null;
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
  totalProperties?: number;
  pendingVerifications?: number;
  openWorkItems?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
