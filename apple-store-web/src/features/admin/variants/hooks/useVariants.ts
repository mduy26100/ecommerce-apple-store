import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { variantsApi } from "../api/variants.api";
import { PRODUCTS_QUERY_KEYS } from "../../products/hooks/useProducts";
import type {
  CreateVariantPayload,
  UpdateVariantPayload,
} from "../types/variant.types";

export const VARIANTS_QUERY_KEYS = {
  BY_PRODUCT: (productId: number) =>
    ["admin", "variants", "product", productId] as const,
  DETAIL: (id: number) => ["admin", "variants", "detail", id] as const,
};

export const useVariantsByProduct = (productId: number) => {
  return useQuery({
    queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
    queryFn: () => variantsApi.getByProductId(productId),
    enabled: productId > 0,
    staleTime: 30 * 1000,
  });
};

export const useVariantDetail = (id: number) => {
  return useQuery({
    queryKey: VARIANTS_QUERY_KEYS.DETAIL(id),
    queryFn: () => variantsApi.getById(id),
    enabled: id > 0,
  });
};

export const useCreateVariant = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVariantPayload) => variantsApi.create(payload),
    onSuccess: () => {
      message.success("Thêm phiên bản thành công!");
      queryClient.invalidateQueries({
        queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
      });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.ALL });
    },
  });
};

export const useUpdateVariant = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVariantPayload }) =>
      variantsApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật phiên bản thành công!");
      queryClient.invalidateQueries({
        queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
      });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.ALL });
    },
  });
};

export const useDeleteVariant = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => variantsApi.delete(id),
    onSuccess: () => {
      message.success("Xóa phiên bản thành công!");
      queryClient.invalidateQueries({
        queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
      });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.ALL });
    },
  });
};
