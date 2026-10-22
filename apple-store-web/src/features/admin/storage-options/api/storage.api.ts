import { api } from "@core/api/axios.config";
import type {
  StorageOptionItem,
  StorageOptionPagedList,
  StorageOptionPagedParams,
  CreateStorageOptionPayload,
  UpdateStorageOptionPayload,
} from "../types/storage.types";

export const storageOptionsApi = {
  getPaged: async (params?: StorageOptionPagedParams): Promise<StorageOptionPagedList> => {
    const response = await api.get<StorageOptionPagedList>("/api/manager/storage-options", {
      params,
    });
    return response;
  },

  getAll: async (): Promise<StorageOptionItem[]> => {
    const response = await api.get<StorageOptionItem[]>("/api/manager/storage-options/all");
    return response;
  },

  getById: async (id: number): Promise<StorageOptionItem> => {
    const response = await api.get<StorageOptionItem>(`/api/manager/storage-options/${id}`);
    return response;
  },

  create: async (payload: CreateStorageOptionPayload): Promise<void> => {
    await api.post("/api/manager/storage-options", payload);
  },

  update: async (id: number, payload: UpdateStorageOptionPayload): Promise<void> => {
    await api.put(`/api/manager/storage-options/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/storage-options/${id}`);
  },
};
