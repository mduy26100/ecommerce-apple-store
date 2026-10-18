import { api } from "@core/api/axios.config";
import type {
  CategoryItem,
  CategoryPagedList,
  CategoryPagedParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";

export const categoriesApi = {
  getPaged: async (params?: CategoryPagedParams): Promise<CategoryPagedList> => {
    const response = await api.get<CategoryPagedList>("/api/manager/categories", {
      params,
    });
    return response;
  },

  getAll: async (): Promise<CategoryItem[]> => {
    const response = await api.get<CategoryItem[]>("/api/categories");
    return response;
  },

  getById: async (id: number): Promise<CategoryItem> => {
    const response = await api.get<CategoryItem>(`/api/manager/categories/${id}`);
    return response;
  },

  create: async (payload: CreateCategoryPayload): Promise<void> => {
    await api.post("/api/manager/categories", payload);
  },

  update: async (id: number, payload: UpdateCategoryPayload): Promise<void> => {
    await api.put(`/api/manager/categories/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/categories/${id}`);
  },
};
