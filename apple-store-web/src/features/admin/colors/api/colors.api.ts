import { api } from "@core/api/axios.config";
import type {
  ColorItem,
  ColorPagedList,
  ColorPagedParams,
  CreateColorPayload,
  UpdateColorPayload,
} from "../types/colors.types";

export const colorsApi = {
  getPaged: async (params?: ColorPagedParams): Promise<ColorPagedList> => {
    const response = await api.get<ColorPagedList>("/api/manager/colors", { params });
    return response;
  },

  getAll: async (): Promise<ColorItem[]> => {
    const response = await api.get<ColorItem[]>("/api/manager/colors/all");
    return response;
  },

  getById: async (id: number): Promise<ColorItem> => {
    const response = await api.get<ColorItem>(`/api/manager/colors/${id}`);
    return response;
  },

  create: async (payload: CreateColorPayload): Promise<void> => {
    await api.post("/api/manager/colors", payload);
  },

  update: async (id: number, payload: UpdateColorPayload): Promise<void> => {
    await api.put(`/api/manager/colors/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/colors/${id}`);
  },
};
