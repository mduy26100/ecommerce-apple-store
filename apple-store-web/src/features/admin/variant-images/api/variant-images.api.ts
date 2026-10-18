import { api } from "@core/api/axios.config";
import type {
  VariantImageItem,
  CreateVariantImagePayload,
  UpdateVariantImagePayload,
} from "../types/variant-image.types";

export const variantImagesApi = {
  getByVariantId: async (variantId: number): Promise<VariantImageItem[]> => {
    const response = await api.get<VariantImageItem[]>(
      `/api/manager/variant-images/by-variant/${variantId}`
    );
    return response;
  },

  getById: async (id: number): Promise<VariantImageItem> => {
    const response = await api.get<VariantImageItem>(
      `/api/manager/variant-images/${id}`
    );
    return response;
  },

  create: async (payload: CreateVariantImagePayload): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/variant-images",
      payload
    );
    return response;
  },

  update: async (id: number, payload: UpdateVariantImagePayload): Promise<void> => {
    await api.put(`/api/manager/variant-images/${id}`, payload);
  },

  setPrimary: async (id: number): Promise<void> => {
    await api.put(`/api/manager/variant-images/${id}/primary`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/variant-images/${id}`);
  },
};
