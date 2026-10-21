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
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("slug", payload.slug);
    if (payload.description) formData.append("description", payload.description);
    if (payload.displayOrder !== undefined) formData.append("displayOrder", payload.displayOrder.toString());
    if (payload.isActive !== undefined) formData.append("isActive", payload.isActive.toString());
    if (payload.imageFile) formData.append("image", payload.imageFile);
    await api.post("/api/manager/categories", formData);
  },

  update: async (id: number, payload: UpdateCategoryPayload): Promise<void> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("slug", payload.slug);
    if (payload.description) formData.append("description", payload.description);
    if (payload.displayOrder !== undefined) formData.append("displayOrder", payload.displayOrder.toString());
    if (payload.isActive !== undefined) formData.append("isActive", payload.isActive.toString());
    if (payload.imageFile) formData.append("image", payload.imageFile);
    await api.put(`/api/manager/categories/${id}`, formData);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/manager/categories/${id}`);
  },
};
