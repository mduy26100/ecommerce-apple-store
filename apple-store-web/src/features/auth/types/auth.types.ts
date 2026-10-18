/**
 * Authentication and User models for the application.
 */

export interface UserDetails {
  id: string;
  role: string;
  tenantId: string | null;
  email?: string;
  fullName?: string;
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
  email: string;
  password?: string;
  fullName: string;
  companyName: string;
}
