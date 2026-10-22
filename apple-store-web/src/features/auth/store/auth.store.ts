import { create } from "zustand";
import type { UserDetails } from "../types/auth.types";
import { AUTH_STATUS } from "../constants/auth.constants";
import type { AuthStatus } from "../constants/auth.constants";
import { tokenStorage } from "@core/storage/token.storage";
import { getUserDetailsFromToken } from "@core/utils/jwt";
import { queryClient } from "@core/api/queryClient";
import { authApi } from "../api/auth.api";

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: UserDetails | null;
  setAuth: (token: string, user: UserDetails | null) => void;
  clearAuth: () => void;
  setNetworkTimeout: () => void;
  initializeAuth: () => Promise<void>;
}

let initAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: AUTH_STATUS.CHECKING_AUTH,
  accessToken: null,
  user: null,

  setAuth: (token, userParam) => {
    tokenStorage.setToken(token);

    const decodedUser = getUserDetailsFromToken(token);

    const mergedUser = decodedUser
      ? { ...userParam, ...decodedUser }
      : userParam;

    set({
      status: AUTH_STATUS.AUTHENTICATED,
      accessToken: token,
      user: mergedUser,
    });
  },

  clearAuth: () => {
    tokenStorage.clearAll();
    queryClient.clear();
    set({
      status: AUTH_STATUS.UNAUTHENTICATED,
      accessToken: null,
      user: null,
    });
  },

  setNetworkTimeout: () => {
    set({
      status: AUTH_STATUS.NETWORK_TIMEOUT,
    });
  },

  initializeAuth: async () => {
    if (get().accessToken) {
      return;
    }

    if (initAuthPromise) {
      return initAuthPromise;
    }

    initAuthPromise = (async () => {
      try {
        const response = await authApi.refreshToken();
        if (response && response.accessToken) {
          get().setAuth(response.accessToken, response.user || null);
          return;
        }
        set({
          status: AUTH_STATUS.UNAUTHENTICATED,
          accessToken: null,
          user: null,
        });
      } catch {
        tokenStorage.clearAll();
        set({
          status: AUTH_STATUS.UNAUTHENTICATED,
          accessToken: null,
          user: null,
        });
      } finally {
        initAuthPromise = null;
      }
    })();

    return initAuthPromise;
  },
}));
