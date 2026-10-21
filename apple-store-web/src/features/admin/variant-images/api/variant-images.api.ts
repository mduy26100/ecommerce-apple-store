import { api } from "@core/api/axios.config";
import type {
  VariantImageItem,
  CreateVariantImagePayload,
  CreateBatchVariantImagesPayload,
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
    const formData = new FormData();
    formData.append("productVariantId", payload.productVariantId.toString());
    if (payload.altText) formData.append("altText", payload.altText);
    if (payload.displayOrder !== undefined) formData.append("displayOrder", payload.displayOrder.toString());
    if (payload.isPrimary !== undefined) formData.append("isPrimary", payload.isPrimary.toString());
    if (payload.file) formData.append("file", payload.file);
    const response = await api.post<{ id: number }>(
      "/api/manager/variant-images",
      formData
    );
    return response;
  },

  createBatch: async (payload: CreateBatchVariantImagesPayload): Promise<VariantImageItem[]> => {
    const formData = new FormData();
    formData.append("productVariantId", payload.productVariantId.toString());
    if (payload.altText) formData.append("altText", payload.altText);
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
    const response = await api.post<VariantImageItem[]>(
      "/api/manager/variant-images/batch",
      formData
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
