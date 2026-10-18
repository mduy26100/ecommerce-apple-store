import { create } from 'zustand';
import type { UserDetails } from '../types/auth.types';
import { AUTH_STATUS } from '../constants/auth.constants';
import type { AuthStatus } from '../constants/auth.constants';
import { tokenStorage } from '@core/storage/token.storage';
import { getUserDetailsFromToken } from '@core/utils/jwt';
import { queryClient } from '@core/api/queryClient';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: UserDetails | null;
  setAuth: (token: string, user: UserDetails | null) => void;
  clearAuth: () => void;
  setNetworkTimeout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  /* =========================================================================
   * [AUTH BYPASS] Cấu hình auth gốc khi có Backend:
   * =========================================================================
  status: AUTH_STATUS.CHECKING_AUTH,
  accessToken: tokenStorage.getToken(),
  user: null, // Initialized as null (RAM-only)
  * ========================================================================= */

  // [AUTH BYPASS] Tạm thời cấu hình mock auth để không cần login mà vẫn vào thẳng Dashboard
  status: AUTH_STATUS.AUTHENTICATED,
  accessToken: "dev-mock-access-token",
  user: {
    id: "dev-admin-id",
    email: "admin@apple-store.com",
    fullName: "Apple Admin",
    role: "SuperAdmin",
    tenantId: "apple-tenant-1",
  },

  setAuth: (token, userParam) => {
    tokenStorage.setToken(token);

    // Decode user details from JWT token
    const decodedUser = getUserDetailsFromToken(token);
    
    // Merge: prioritize token claims, keep metadata (like fullName/email) from API if available
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
}));
