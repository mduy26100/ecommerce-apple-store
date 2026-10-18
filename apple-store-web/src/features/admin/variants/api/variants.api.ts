import { api } from "@core/api/axios.config";
import type {
  ProductVariantItem,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "../types/variant.types";

export const variantsApi = {
  getByProductId: async (productId: number): Promise<ProductVariantItem[]> => {
    const response = await api.get<ProductVariantItem[]>(
      `/api/manager/product-variants/by-product/${productId}`
    );
    return response;
  },

  getById: async (id: number): Promise<ProductVariantItem> => {
    const response = await api.get<ProductVariantItem>(
      `/api/manager/product-variants/${id}`
    );
    return response;
  },

  create: async (payload: CreateVariantPayload): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/product-variants",
      payload
    );
    return response;
  },

  update: async (id: number, payload: UpdateVariantPayload): Promise<void> => {
    await api.put(`/api/manager/product-variants/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/product-variants/${id}`);
  },
};
