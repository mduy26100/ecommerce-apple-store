import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { specificationsApi } from "../api/specifications.api";
import type {
  CreateProductSpecificationGroupRequest,
  UpdateProductSpecificationGroupRequest,
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
  ReorderGroupRequest,
  ReorderSpecRequest,
} from "../types/specification.types";

export const SPECIFICATIONS_KEY = "admin-specifications";

export const useSpecificationGroups = (productId?: number) => {
  return useQuery({
    queryKey: [SPECIFICATIONS_KEY, productId],
    queryFn: () => specificationsApi.getByProductId(productId!),
    enabled: Boolean(productId),
  });
};

export const useSpecifications = useSpecificationGroups;

export const useCreateSpecificationGroup = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductSpecificationGroupRequest) =>
      specificationsApi.createGroup(payload),
    onSuccess: () => {
      message.success("Thêm nhóm thông số thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể thêm nhóm thông số";
      message.error(errorMsg);
    },
  });
};

export const useUpdateSpecificationGroup = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductSpecificationGroupRequest;
    }) => specificationsApi.updateGroup(id, payload),
    onSuccess: () => {
      message.success("Cập nhật nhóm thông số thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể cập nhật nhóm thông số";
      message.error(errorMsg);
    },
  });
};

export const useDeleteSpecificationGroup = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => specificationsApi.deleteGroup(id),
    onSuccess: () => {
      message.success("Xóa nhóm thông số thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể xóa nhóm thông số";
      message.error(errorMsg);
    },
  });
};

export const useReorderSpecificationGroups = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderGroupRequest) =>
      specificationsApi.reorderGroups(productId!, payload),
    onSuccess: () => {
      message.success("Cập nhật thứ tự nhóm thông số thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể đổi thứ tự nhóm thông số";
      message.error(errorMsg);
    },
  });
};

export const useCreateSpecification = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductSpecificationRequest) =>
      specificationsApi.createSpec(payload),
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
    }) => specificationsApi.updateSpec(id, payload),
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
    mutationFn: (id: number) => specificationsApi.deleteSpec(id),
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

export const useReorderSpecifications = (productId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: number;
      payload: ReorderSpecRequest;
    }) => specificationsApi.reorderSpecs(groupId, payload),
    onSuccess: () => {
      message.success("Cập nhật thứ tự thông số thành công");
      queryClient.invalidateQueries({ queryKey: [SPECIFICATIONS_KEY, productId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể đổi thứ tự thông số";
      message.error(errorMsg);
    },
  });
};
