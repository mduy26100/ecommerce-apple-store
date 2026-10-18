import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { colorsApi } from "../api/colors.api";
import type {
  ColorPagedParams,
  CreateColorPayload,
  UpdateColorPayload,
} from "../types/colors.types";

export const COLORS_QUERY_KEYS = {
  ALL: ["admin", "colors"] as const,
  PAGED: (params?: ColorPagedParams) => ["admin", "colors", "paged", params] as const,
  DETAIL: (id: number) => ["admin", "colors", "detail", id] as const,
};

export const useColorsPaged = (params?: ColorPagedParams) => {
  return useQuery({
    queryKey: COLORS_QUERY_KEYS.PAGED(params),
    queryFn: () => colorsApi.getPaged(params),
    staleTime: 60 * 1000,
  });
};

export const useColorsAll = () => {
  return useQuery({
    queryKey: COLORS_QUERY_KEYS.ALL,
    queryFn: () => colorsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useColorDetail = (id: number) => {
  return useQuery({
    queryKey: COLORS_QUERY_KEYS.DETAIL(id),
    queryFn: () => colorsApi.getById(id),
    enabled: id > 0,
  });
};

export const useCreateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateColorPayload) => colorsApi.create(payload),
    onSuccess: () => {
      message.success("Thêm màu sắc thành công!");
      queryClient.invalidateQueries({ queryKey: COLORS_QUERY_KEYS.ALL });
    },
  });
};

export const useUpdateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateColorPayload }) =>
      colorsApi.update(id, payload),
    onSuccess: () => {
      message.success("Cập nhật màu sắc thành công!");
      queryClient.invalidateQueries({ queryKey: COLORS_QUERY_KEYS.ALL });
    },
  });
};

export const useDeleteColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => colorsApi.delete(id),
    onSuccess: () => {
      message.success("Xóa màu sắc thành công!");
      queryClient.invalidateQueries({ queryKey: COLORS_QUERY_KEYS.ALL });
    },
  });
};
