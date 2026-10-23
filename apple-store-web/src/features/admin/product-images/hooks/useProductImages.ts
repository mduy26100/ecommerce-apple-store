import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { productImagesApi } from "../api/product-images.api";
import type {
  CreateProductImagePayload,
  CreateBatchProductImagesPayload,
  UpdateProductImagePayload,
} from "../types/product-image.types";

export const PRODUCT_IMAGES_QUERY_KEY = {
  ALL: ["admin", "product-images"] as const,
  BY_PRODUCT: (productId: number, optionValueId?: number) =>
    ["admin", "product-images", "product", productId, optionValueId] as const,
  DETAIL: (id: number) => ["admin", "product-images", "detail", id] as const,
};

export const useProductImages = (productId: number, optionValueId?: number) => {
  return useQuery({
    queryKey: PRODUCT_IMAGES_QUERY_KEY.BY_PRODUCT(productId, optionValueId),
    queryFn: () => productImagesApi.getByProductId(productId, optionValueId),
    enabled: productId > 0,
  });
};

export const useCreateProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductImagePayload) => productImagesApi.create(payload),
    onSuccess: () => {
      message.success("Tải lên hình ảnh thành công!");
      queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY.ALL });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Không thể tải lên hình ảnh!";
      message.error(msg);
    },
  });
};

export const useCreateBatchProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBatchProductImagesPayload) =>
      productImagesApi.createBatch(payload),
    onSuccess: (res) => {
      message.success(`Đã tải lên thành công ${res.length} hình ảnh!`);
      queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY.ALL });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Không thể tải lên danh sách ảnh!";
      message.error(msg);
    },
  });
};

export const useUpdateProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductImagePayload }) =>
      productImagesApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật thông tin hình ảnh thành công!");
      queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY.ALL });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Không thể cập nhật ảnh!";
      message.error(msg);
    },
  });
};

export const useSetPrimaryProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productImagesApi.setPrimary(id),
    onSuccess: () => {
      message.success("Đã đặt làm ảnh chính của sản phẩm!");
      queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY.ALL });
      queryClient.invalidateQueries({ queryKey: ["admin", "product-options"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "variants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Không thể đặt làm ảnh chính!";
      message.error(msg);
    },
  });
};

export const useSetDefaultProductColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, optionValueId }: { productId: number; optionValueId: number }) =>
      productImagesApi.setDefaultColor(productId, optionValueId),
    onSuccess: () => {
      message.success("Đã cập nhật màu sắc mặc định khi hiển thị!");
      queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY.ALL });
      queryClient.invalidateQueries({ queryKey: ["admin", "product-options"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "variants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Không thể cập nhật màu mặc định!";
      message.error(msg);
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productImagesApi.delete(id),
    onSuccess: () => {
      message.success("Đã xóa hình ảnh thành công!");
      queryClient.invalidateQueries({ queryKey: PRODUCT_IMAGES_QUERY_KEY.ALL });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront", "products"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Không thể xóa ảnh!";
      message.error(msg);
    },
  });
};
