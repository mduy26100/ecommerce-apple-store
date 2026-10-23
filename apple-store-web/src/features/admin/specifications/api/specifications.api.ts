import { api } from "@core/api/axios.config";
import type {
  ProductSpecificationGroupDto,
  ProductSpecificationDto,
  CreateProductSpecificationGroupRequest,
  UpdateProductSpecificationGroupRequest,
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
  ReorderGroupRequest,
  ReorderSpecRequest,
} from "../types/specification.types";

export const specificationsApi = {
  getByProductId: async (productId: number): Promise<ProductSpecificationGroupDto[]> => {
    const response = await api.get<ProductSpecificationGroupDto[]>(
      `/api/manager/product-specifications/by-product/${productId}`
    );
    return response;
  },

  getGroupById: async (id: number): Promise<ProductSpecificationGroupDto> => {
    const response = await api.get<ProductSpecificationGroupDto>(
      `/api/manager/product-specifications/groups/${id}`
    );
    return response;
  },

  createGroup: async (
    payload: CreateProductSpecificationGroupRequest
  ): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/product-specifications/groups",
      payload
    );
    return response;
  },

  updateGroup: async (
    id: number,
    payload: UpdateProductSpecificationGroupRequest
  ): Promise<void> => {
    await api.put(`/api/manager/product-specifications/groups/${id}`, payload);
  },

  deleteGroup: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/product-specifications/groups/${id}`);
  },

  reorderGroups: async (
    productId: number,
    payload: ReorderGroupRequest
  ): Promise<void> => {
    await api.put(
      `/api/manager/product-specifications/groups/by-product/${productId}/reorder`,
      payload
    );
  },

  getSpecById: async (id: number): Promise<ProductSpecificationDto> => {
    const response = await api.get<ProductSpecificationDto>(
      `/api/manager/product-specifications/${id}`
    );
    return response;
  },

  createSpec: async (
    payload: CreateProductSpecificationRequest
  ): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/product-specifications",
      payload
    );
    return response;
  },

  updateSpec: async (
    id: number,
    payload: UpdateProductSpecificationRequest
  ): Promise<void> => {
    await api.put(`/api/manager/product-specifications/${id}`, payload);
  },

  deleteSpec: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/product-specifications/${id}`);
  },

  reorderSpecs: async (
    groupId: number,
    payload: ReorderSpecRequest
  ): Promise<void> => {
    await api.put(
      `/api/manager/product-specifications/by-group/${groupId}/reorder`,
      payload
    );
  },
};
