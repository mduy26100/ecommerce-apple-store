import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { specificationsApi } from "../api/specifications.api";
import type {
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
} from "../types/specification.types";

export const SPECIFICATIONS_KEY = "admin-specifications";

export const useSpecifications = (productId?: number) => {
  return useQuery({
    queryKey: [SPECIFICATIONS_KEY, productId],
    queryFn: () => specificationsApi.getByProductId(productId!),
    enabled: Boolean(productId),
  });
};

export const useCreateSpecification = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductSpecificationRequest) =>
      specificationsApi.create(payload),
    onSuccess: () => {
      message.success("Thêm thông số kỹ thuật thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể thêm thông số kỹ thuật";
      message.error(errorMsg);
    },
  });
};

export const useUpdateSpecification = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductSpecificationRequest;
    }) => specificationsApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật thông số kỹ thuật thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể cập nhật thông số kỹ thuật";
      message.error(errorMsg);
    },
  });
};

export const useDeleteSpecification = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => specificationsApi.delete(id),
    onSuccess: () => {
      message.success("Xóa thông số kỹ thuật thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể xóa thông số kỹ thuật";
      message.error(errorMsg);
    },
  });
};
