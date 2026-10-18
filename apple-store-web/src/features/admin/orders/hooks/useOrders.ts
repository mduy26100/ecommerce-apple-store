import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { ordersApi } from "../api/orders.api";
import type {
  OrderPagedParams,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
  CreateOrderPayload,
} from "../types/order.types";

export const ORDERS_KEY = "admin-orders";

export const useOrders = (params?: OrderPagedParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => ordersApi.getPaged(params),
  });
};

export const useOrderDetail = (id?: number) => {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.getById(id!),
    enabled: Boolean(id),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      message.success("Tạo đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể tạo đơn hàng";
      message.error(errorMsg);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateOrderStatusPayload;
    }) => ordersApi.updateStatus(id, payload),
    onSuccess: () => {
      message.success("Cập nhật trạng thái đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng";
      message.error(errorMsg);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CancelOrderPayload;
    }) => ordersApi.cancel(id, payload),
    onSuccess: () => {
      message.success("Hủy đơn hàng và hoàn tồn kho thành công");
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Không thể hủy đơn hàng";
      message.error(errorMsg);
    },
  });
};
