import { api } from "@core/api/axios.config";
import type {
  ProductDetailItem,
  ProductPagedList,
  ProductPagedParams,
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product.types";

export const productsApi = {
  getPaged: async (params?: ProductPagedParams): Promise<ProductPagedList> => {
    const response = await api.get<ProductPagedList>("/api/manager/products", {
      params,
    });
    return response;
  },

  getById: async (id: number): Promise<ProductDetailItem> => {
    const response = await api.get<ProductDetailItem>(`/api/manager/products/${id}`);
    return response;
  },

  create: async (payload: CreateProductPayload): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>("/api/manager/products", payload);
    return response;
  },

  update: async (id: number, payload: UpdateProductPayload): Promise<void> => {
    await api.put(`/api/manager/products/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/products/${id}`);
  },
};
