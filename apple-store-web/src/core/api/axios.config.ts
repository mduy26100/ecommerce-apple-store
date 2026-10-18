import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useAuthStore, AUTH_ENDPOINTS } from "@features/auth";
import type { ApiResponse } from "@core/models/api.model";
import { message } from "antd";
import { tokenStorage } from "@core/storage/token.storage";
import { ERROR_CODES } from "@core/constants/storage.constants";

export type UnpackApiResponse<T> = T extends ApiResponse<infer U> ? U : T;

export interface CustomAxiosInstance {
  request<T = any>(config: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
  head<T = any>(url: string, config?: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<UnpackApiResponse<T>>;
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Send HTTP-Only Cookies automatically
});

// A dedicated instance for refresh token requests to avoid circular interceptor calls
const refreshInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Dynamically load the mock adapter to ensure 100% tree-shaking in production builds
if (import.meta.env.VITE_USE_MOCK_API === 'true') {
  const { setupMockAdapter } = await import('./mock.api');
  setupMockAdapter(instance);
  setupMockAdapter(refreshInstance);
}

// A flag to trace silent refresh status and hold standard request queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach Access Token from Zustand store
instance.interceptors.request.use(
  (config) => {
    // Skip attaching authorization header for public routes
    const isPublic =
      config.url?.endsWith(AUTH_ENDPOINTS.LOGIN) ||
      config.url?.endsWith(AUTH_ENDPOINTS.REFRESH_TOKEN) ||
      config.url?.endsWith(AUTH_ENDPOINTS.REGISTER);

    if (!isPublic) {
      const token = tokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Unpack success data and handle errors (Silent Refresh & Global Errors)
instance.interceptors.response.use(
  (response) => {
    const apiResponse = response.data;
    // Unwrap the response if it matches the standard format
    if (apiResponse && Object.prototype.hasOwnProperty.call(apiResponse, 'data')) {
      return apiResponse.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Silent Refresh / Token Expiry)
    const isLoginRequest = originalRequest?.url?.endsWith(AUTH_ENDPOINTS.LOGIN);
    const isRefreshRequest = originalRequest?.url?.endsWith(AUTH_ENDPOINTS.REFRESH_TOKEN);
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            failedQueue = failedQueue.filter((item) => item.resolve !== resolveAndRemove);
            const timeoutError = new Error(ERROR_CODES.REFRESH_TIMEOUT);
            useAuthStore.getState().setNetworkTimeout();
            reject(timeoutError);
          }, 15000); // 15 seconds queue timeout

          const resolveAndRemove = (token: string) => {
            clearTimeout(timeoutId);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          };

          const rejectAndRemove = (err: any) => {
            clearTimeout(timeoutId);
            reject(err);
          };

          failedQueue.push({
            resolve: resolveAndRemove,
            reject: rejectAndRemove,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshInstance
          .post(
            AUTH_ENDPOINTS.REFRESH_TOKEN,
            {},
            { withCredentials: true }
          )
          .then((res) => {
            const data = res.data;
            const payload = data.data || data; // Fallback in case of mock/unwrapped response
            const { accessToken, user } = payload;

            // Save new token to RAM
            useAuthStore.getState().setAuth(accessToken, user);

            // Dispatch all waiting requests in queue
            processQueue(null, accessToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            resolve(instance(originalRequest));
          })
          .catch((refreshError) => {
            // Real refresh failure (Session expired)
            processQueue(refreshError, null);
            useAuthStore.getState().clearAuth();
            message.error('Session expired. Please log in again.');
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // Global Error Handler for other statuses
    const status = error.response?.status;
    
    // Extract clean backend message if present to replace standard Axios error message
    const backendMsg = error.response?.data?.error?.message || error.response?.data?.message;
    if (backendMsg) {
      error.message = backendMsg;
    }
    const errorMsg = error.message;

    // Do not show generic errors if it is a REFRESH_TIMEOUT error (which is handled by conditional rendering in App)
    if (error.message === ERROR_CODES.REFRESH_TIMEOUT) {
      return Promise.reject(error);
    }

    if (status === 403) {
      message.error('You do not have permission to access this feature.');
    } else if (status === 500) {
      message.error('System unavailable. Please try again later.');
    } else if (status === 400) {
      message.error(errorMsg || 'Invalid request.');
    } else if (error.code === 'ECONNABORTED') {
      message.error('Network connection timeout. Please check your internet connection.');
    } else if (!status) {
      message.error('Unable to connect to the server.');
    } else {
      // Show generic toast for error status other than 401 (login page has its own alert handling for 401)
      if (status !== 401) {
        message.error(errorMsg || 'An error occurred, please try again.');
      }
    }

    return Promise.reject(error);
  }
);

export const api = instance as unknown as CustomAxiosInstance;
export default api;
