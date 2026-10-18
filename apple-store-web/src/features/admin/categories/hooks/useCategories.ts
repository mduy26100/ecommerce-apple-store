import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { categoriesApi } from "../api/categories.api";
import type {
  CategoryPagedParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";

export const CATEGORIES_QUERY_KEYS = {
  ALL: ["admin", "categories"] as const,
  PAGED: (params?: CategoryPagedParams) =>
    ["admin", "categories", "paged", params] as const,
  DETAIL: (id: number) => ["admin", "categories", "detail", id] as const,
};

export const useCategoriesPaged = (params?: CategoryPagedParams) => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.PAGED(params),
    queryFn: () => categoriesApi.getPaged(params),
    staleTime: 60 * 1000,
  });
};

export const useCategoriesAll = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.ALL,
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoryDetail = (id: number) => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.DETAIL(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: id > 0,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.create(payload),
    onSuccess: () => {
      message.success("Thêm danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.ALL });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryPayload }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.ALL });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      message.success("Xóa danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.ALL });
    },
  });
};
