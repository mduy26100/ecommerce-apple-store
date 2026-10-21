import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { variantImagesApi } from "../api/variant-images.api";
import { VARIANTS_QUERY_KEYS } from "@features/admin/variants/hooks/useVariants";
import type {
  CreateVariantImagePayload,
  CreateBatchVariantImagesPayload,
  UpdateVariantImagePayload,
} from "../types/variant-image.types";

export const VARIANT_IMAGES_QUERY_KEYS = {
  BY_VARIANT: (variantId: number) =>
    ["admin", "variant-images", "variant", variantId] as const,
  DETAIL: (id: number) => ["admin", "variant-images", "detail", id] as const,
};

export const useVariantImages = (variantId: number) => {
  return useQuery({
    queryKey: VARIANT_IMAGES_QUERY_KEYS.BY_VARIANT(variantId),
    queryFn: () => variantImagesApi.getByVariantId(variantId),
    enabled: variantId > 0,
    staleTime: 30 * 1000,
  });
};

export const useCreateVariantImage = (variantId: number, productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVariantImagePayload) =>
      variantImagesApi.create(payload),
    onSuccess: () => {
      message.success("Thêm ảnh thành công!");
      queryClient.invalidateQueries({
        queryKey: VARIANT_IMAGES_QUERY_KEYS.BY_VARIANT(variantId),
      });
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
        });
      }
    },
  });
};

export const useCreateBatchVariantImages = (variantId: number, productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBatchVariantImagesPayload) =>
      variantImagesApi.createBatch(payload),
    onSuccess: (data) => {
      message.success(`Đã thêm thành công ${data.length} ảnh vào bộ sưu tập!`);
      queryClient.invalidateQueries({
        queryKey: VARIANT_IMAGES_QUERY_KEYS.BY_VARIANT(variantId),
      });
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
        });
      }
    },
  });
};

export const useUpdateVariantImage = (variantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVariantImagePayload }) =>
      variantImagesApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật ảnh thành công!");
      queryClient.invalidateQueries({
        queryKey: VARIANT_IMAGES_QUERY_KEYS.BY_VARIANT(variantId),
      });
    },
  });
};

export const useSetPrimaryVariantImage = (variantId: number, productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => variantImagesApi.setPrimary(id),
    onSuccess: () => {
      message.success("Đã đặt làm ảnh chính!");
      queryClient.invalidateQueries({
        queryKey: VARIANT_IMAGES_QUERY_KEYS.BY_VARIANT(variantId),
      });
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
        });
      }
    },
  });
};

export const useDeleteVariantImage = (variantId: number, productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => variantImagesApi.delete(id),
    onSuccess: () => {
      message.success("Xóa ảnh thành công!");
      queryClient.invalidateQueries({
        queryKey: VARIANT_IMAGES_QUERY_KEYS.BY_VARIANT(variantId),
      });
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: VARIANTS_QUERY_KEYS.BY_PRODUCT(productId),
        });
      }
    },
  });
};
