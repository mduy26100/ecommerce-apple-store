export interface UserItem {
  id: number;
  email: string;
  userName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  lockoutEnd?: string;
  isLocked: boolean;
  lockoutDaysRemaining?: number;
  totalOrders: number;
  totalSpent: number;
}

export interface UserDetail {
  id: number;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  lockoutEnd?: string;
  isLocked: boolean;
  lockoutDaysRemaining?: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface UserPagedParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface UserPagedList {
  items: UserItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  userName?: string;
  phoneNumber?: string;
  password: string;
  confirmPassword?: string;
}

export interface UpdateUserPayload {
  fullName: string;
  phoneNumber?: string;
}

export interface LockUserPayload {
  days: number;
  reason?: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

