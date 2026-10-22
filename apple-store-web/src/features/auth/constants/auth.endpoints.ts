const API_PREFIX = '/api/v1';

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}/auth/login`,
  LOGOUT: `${API_PREFIX}/auth/logout`,
  REFRESH_TOKEN: `${API_PREFIX}/auth/refresh-token`,
  REGISTER: `${API_PREFIX}/auth/register`,
} as const;

export default AUTH_ENDPOINTS;
