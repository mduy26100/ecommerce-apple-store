import { api } from "@core/api/axios.config";
import type {
  ProductSpecificationDto,
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
} from "../types/specification.types";

export const specificationsApi = {
  getByProductId: async (productId: number): Promise<ProductSpecificationDto[]> => {
    const response = await api.get<ProductSpecificationDto[]>(
      `/api/manager/product-specifications/by-product/${productId}`
    );
    return response;
  },

  getById: async (id: number): Promise<ProductSpecificationDto> => {
    const response = await api.get<ProductSpecificationDto>(
      `/api/manager/product-specifications/${id}`
    );
    return response;
  },

  create: async (payload: CreateProductSpecificationRequest): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/product-specifications",
      payload
    );
    return response;
  },

  update: async (
    id: number,
    payload: UpdateProductSpecificationRequest
  ): Promise<void> => {
    await api.put(`/api/manager/product-specifications/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/product-specifications/${id}`);
  },
};
