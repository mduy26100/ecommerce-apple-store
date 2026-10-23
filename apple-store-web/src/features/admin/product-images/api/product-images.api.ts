import { api } from "@core/api/axios.config";
import type {
  ProductImageItem,
  CreateProductImagePayload,
  CreateBatchProductImagesPayload,
  UpdateProductImagePayload,
} from "../types/product-image.types";

export const productImagesApi = {
  getByProductId: async (
    productId: number,
    optionValueId?: number
  ): Promise<ProductImageItem[]> => {
    const query =
      optionValueId !== undefined && optionValueId !== null
        ? `?optionValueId=${optionValueId}`
        : "";
    return await api.get<ProductImageItem[]>(
      `/api/manager/product-images/by-product/${productId}${query}`
    );
  },

  getById: async (id: number): Promise<ProductImageItem> => {
    return await api.get<ProductImageItem>(`/api/manager/product-images/${id}`);
  },

  create: async (payload: CreateProductImagePayload): Promise<{ id: number }> => {
    const formData = new FormData();
    formData.append("productId", payload.productId.toString());
    if (payload.optionValueId !== undefined && payload.optionValueId !== null) {
      formData.append("optionValueId", payload.optionValueId.toString());
    }
    if (payload.altText) formData.append("altText", payload.altText);
    if (payload.displayOrder !== undefined) {
      formData.append("displayOrder", payload.displayOrder.toString());
    }
    if (payload.isPrimary !== undefined) {
      formData.append("isPrimary", payload.isPrimary.toString());
    }
    if (payload.file) formData.append("file", payload.file);

    return await api.post<{ id: number }>("/api/manager/product-images", formData);
  },

  createBatch: async (
    payload: CreateBatchProductImagesPayload
  ): Promise<ProductImageItem[]> => {
    const formData = new FormData();
    formData.append("productId", payload.productId.toString());
    if (payload.optionValueId !== undefined && payload.optionValueId !== null) {
      formData.append("optionValueId", payload.optionValueId.toString());
    }
    if (payload.altText) formData.append("altText", payload.altText);
    payload.files.forEach((file) => {
      formData.append("files", file);
    });

    return await api.post<ProductImageItem[]>(
      "/api/manager/product-images/batch",
      formData
    );
  },

  update: async (id: number, payload: UpdateProductImagePayload): Promise<void> => {
    await api.put(`/api/manager/product-images/${id}`, payload);
  },

  setPrimary: async (id: number): Promise<void> => {
    await api.put(`/api/manager/product-images/${id}/primary`);
  },

  setDefaultColor: async (productId: number, optionValueId: number): Promise<void> => {
    await api.put(`/api/manager/product-images/by-product/${productId}/default-color/${optionValueId}`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/product-images/${id}`);
  },
};
