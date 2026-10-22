export interface UserDetails {
  id: string;
  role: string;
  tenantId: string | null;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresInMinutes: number;
  user: UserDetails;
}

export interface LoginRequest {
  identifier: string;
  password?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
}
