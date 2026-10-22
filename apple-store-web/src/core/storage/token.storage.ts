let inMemoryToken: string | null = null;

export const tokenStorage = {
  getToken: (): string | null => {
    return inMemoryToken;
  },

  setToken: (token: string): void => {
    inMemoryToken = token;
  },

  clearToken: (): void => {
    inMemoryToken = null;
  },

  clearAll: (): void => {
    inMemoryToken = null;
  },
};

export default tokenStorage;
