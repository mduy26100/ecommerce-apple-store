import { api } from "@core/api/axios.config";
import type {
  ProductVariantItem,
  CreateVariantPayload,
  UpdateVariantPayload,
  ProductOptionItem,
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

  getProductOptions: async (productId: number): Promise<ProductOptionItem[]> => {
    const response = await api.get<ProductOptionItem[]>(
      `/api/manager/product-options/by-product/${productId}`
    );
    return response;
  },

  createProductOption: async (payload: { productId: number; name: string; displayOrder?: number }): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/product-options",
      payload
    );
    return response;
  },

  updateProductOption: async (
    id: number,
    payload: { name: string; displayOrder?: number }
  ): Promise<void> => {
    await api.put(`/api/manager/product-options/${id}`, payload);
  },

  createProductOptionValue: async (payload: { optionId: number; value: string; colorHexCode?: string; displayOrder?: number }): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/product-options/values",
      payload
    );
    return response;
  },

  updateProductOptionValue: async (
    id: number,
    payload: { value: string; colorHexCode?: string; displayOrder?: number }
  ): Promise<void> => {
    await api.put(`/api/manager/product-options/values/${id}`, payload);
  },

  deleteProductOption: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/product-options/${id}`);
  },

  deleteProductOptionValue: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/product-options/values/${id}`);
  },
};
