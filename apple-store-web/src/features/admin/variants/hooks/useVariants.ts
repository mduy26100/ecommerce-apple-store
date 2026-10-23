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

export const useProductOptions = (productId: number) => {
  return useQuery({
    queryKey: ["admin", "product-options", productId],
    queryFn: () => variantsApi.getProductOptions(productId),
    enabled: productId > 0,
  });
};

export const useCreateProductOption = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { productId: number; name: string; displayOrder?: number }) =>
      variantsApi.createProductOption(payload),
    onSuccess: () => {
      message.success("Thêm nhóm thuộc tính thành công!");
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-options", productId],
      });
    },
  });
};

export const useUpdateProductOption = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; displayOrder?: number } }) =>
      variantsApi.updateProductOption(id, payload),
    onSuccess: () => {
      message.success("Cập nhật nhóm thuộc tính thành công!");
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-options", productId],
      });
      queryClient.invalidateQueries({
        queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
      });
    },
  });
};

export const useCreateProductOptionValue = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      optionId: number;
      value: string;
      colorHexCode?: string;
      displayOrder?: number;
    }) => variantsApi.createProductOptionValue(payload),
    onSuccess: () => {
      message.success("Thêm giá trị thuộc tính thành công!");
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-options", productId],
      });
      queryClient.invalidateQueries({
        queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
      });
    },
  });
};

export const useUpdateProductOptionValue = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { value: string; colorHexCode?: string; displayOrder?: number };
    }) => variantsApi.updateProductOptionValue(id, payload),
    onSuccess: () => {
      message.success("Cập nhật giá trị thuộc tính thành công!");
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-options", productId],
      });
      queryClient.invalidateQueries({
        queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
      });
    },
  });
};

export const useDeleteProductOption = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => variantsApi.deleteProductOption(id),
    onSuccess: () => {
      message.success("Xóa nhóm thuộc tính thành công!");
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-options", productId],
      });
    },
  });
};

export const useDeleteProductOptionValue = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => variantsApi.deleteProductOptionValue(id),
    onSuccess: () => {
      message.success("Xóa giá trị thuộc tính thành công!");
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-options", productId],
      });
    },
  });
};
