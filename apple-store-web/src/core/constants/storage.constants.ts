/**
 * Core storage and session constants.
 * Prevents magic strings across storage wrappers and API configs.
 */
export const STORAGE_KEYS = {
} as const;

export const MOCK_STORAGE_KEYS = {
  MOCK_COOKIE_REFRESH_TOKEN: '__mock_http_only_cookie_refresh_token',
} as const;

export const ERROR_CODES = {
  REFRESH_TIMEOUT: 'REFRESH_TIMEOUT',
} as const;
