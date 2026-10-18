import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { productsApi } from "../api/products.api";
import type {
  ProductPagedParams,
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product.types";

export const PRODUCTS_QUERY_KEYS = {
  ALL: ["admin", "products"] as const,
  PAGED: (params?: ProductPagedParams) =>
    ["admin", "products", "paged", params] as const,
  DETAIL: (id: number) => ["admin", "products", "detail", id] as const,
};

export const useProductsPaged = (params?: ProductPagedParams) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.PAGED(params),
    queryFn: () => productsApi.getPaged(params),
    staleTime: 60 * 1000,
  });
};

export const useProductDetail = (id: number) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.DETAIL(id),
    queryFn: () => productsApi.getById(id),
    enabled: id > 0,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      message.success("Thêm sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.ALL });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductPayload }) =>
      productsApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.ALL });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      message.success("Xóa sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.ALL });
    },
  });
};
