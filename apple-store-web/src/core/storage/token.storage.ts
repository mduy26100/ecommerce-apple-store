/**
 * Storage wrapper to manage authentication credentials in memory.
 * Acts as an abstraction layer so UI hooks, API configs, and mock systems do not access storage directly.
 */
// [AUTH BYPASS] Tạm thời gán token giả lập để gửi kèm request header nếu cần
let _inMemoryToken: string | null = "dev-mock-access-token";

export const tokenStorage = {
  getToken: (): string | null => {
    return _inMemoryToken;
  },

  setToken: (token: string): void => {
    _inMemoryToken = token;
  },

  clearToken: (): void => {
    _inMemoryToken = null;
  },

  clearAll: (): void => {
    _inMemoryToken = null;
  }
};

export default tokenStorage;
