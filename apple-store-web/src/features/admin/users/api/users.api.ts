import { api } from "@core/api/axios.config";
import type {
  UserDetail,
  UserItem,
  UserPagedParams,
  CreateUserPayload,
  UpdateUserPayload,
  LockUserPayload,
  ResetPasswordPayload,
} from "../types/user.types";

export const usersApi = {
  getPaged: async (params?: UserPagedParams): Promise<UserItem[]> => {
    const response = await api.get<UserItem[]>("/api/manager/users", {
      params,
    });
    return response;
  },

  getById: async (id: number): Promise<UserDetail> => {
    const response = await api.get<UserDetail>(`/api/manager/users/${id}`);
    return response;
  },

  create: async (payload: CreateUserPayload): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>("/api/manager/users", payload);
    return response;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<void> => {
    await api.put(`/api/manager/users/${id}`, payload);
  },

  lock: async (id: number, payload: LockUserPayload): Promise<void> => {
    await api.post(`/api/manager/users/${id}/lock`, payload);
  },

  unlock: async (id: number): Promise<void> => {
    await api.post(`/api/manager/users/${id}/unlock`);
  },

  resetPassword: async (id: number, payload: ResetPasswordPayload): Promise<void> => {
    await api.post(`/api/manager/users/${id}/reset-password`, payload);
  },
};

