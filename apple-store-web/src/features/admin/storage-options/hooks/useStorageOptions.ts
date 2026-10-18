import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { storageOptionsApi } from "../api/storage.api";
import type {
  StorageOptionPagedParams,
  CreateStorageOptionPayload,
  UpdateStorageOptionPayload,
} from "../types/storage.types";

export const STORAGE_OPTIONS_QUERY_KEYS = {
  ALL: ["admin", "storage-options"] as const,
  PAGED: (params?: StorageOptionPagedParams) =>
    ["admin", "storage-options", "paged", params] as const,
  DETAIL: (id: number) => ["admin", "storage-options", "detail", id] as const,
};

export const useStorageOptionsPaged = (params?: StorageOptionPagedParams) => {
  return useQuery({
    queryKey: STORAGE_OPTIONS_QUERY_KEYS.PAGED(params),
    queryFn: () => storageOptionsApi.getPaged(params),
    staleTime: 60 * 1000,
  });
};

export const useStorageOptionsAll = () => {
  return useQuery({
    queryKey: STORAGE_OPTIONS_QUERY_KEYS.ALL,
    queryFn: () => storageOptionsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useStorageOptionDetail = (id: number) => {
  return useQuery({
    queryKey: STORAGE_OPTIONS_QUERY_KEYS.DETAIL(id),
    queryFn: () => storageOptionsApi.getById(id),
    enabled: id > 0,
  });
};

export const useCreateStorageOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStorageOptionPayload) => storageOptionsApi.create(payload),
    onSuccess: () => {
      message.success("Thêm tùy chọn dung lượng thành công!");
      queryClient.invalidateQueries({ queryKey: STORAGE_OPTIONS_QUERY_KEYS.ALL });
    },
  });
};

export const useUpdateStorageOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStorageOptionPayload }) =>
      storageOptionsApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật tùy chọn dung lượng thành công!");
      queryClient.invalidateQueries({ queryKey: STORAGE_OPTIONS_QUERY_KEYS.ALL });
    },
  });
};

export const useDeleteStorageOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => storageOptionsApi.delete(id),
    onSuccess: () => {
      message.success("Xóa tùy chọn dung lượng thành công!");
      queryClient.invalidateQueries({ queryKey: STORAGE_OPTIONS_QUERY_KEYS.ALL });
    },
  });
};
