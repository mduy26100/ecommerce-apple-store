import { api } from "@core/api/axios.config";
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
} from "@features/auth/types/auth.types";
import { AUTH_ENDPOINTS } from "@features/auth/constants/auth.endpoints";

let refreshTokenPromise: Promise<AuthResponse> | null = null;

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials,
    );
    return response;
  },

  register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      AUTH_ENDPOINTS.REGISTER,
      credentials,
    );
    return response;
  },

  logout: async (): Promise<void> => {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
  },

  refreshToken: async (): Promise<AuthResponse> => {
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }

    refreshTokenPromise = (async () => {
      try {
        const response = await api.post<AuthResponse>(
          AUTH_ENDPOINTS.REFRESH_TOKEN,
        );
        return response;
      } finally {
        refreshTokenPromise = null;
      }
    })();

    return refreshTokenPromise;
  },
};

export default authApi;
