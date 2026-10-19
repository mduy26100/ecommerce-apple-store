import { api } from "@core/api/axios.config";
import type {
  OrderDetailDto,
  OrderPagedParams,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
  CreateOrderPayload,
} from "../types/order.types";

export const ordersApi = {
  getPaged: async (params?: OrderPagedParams): Promise<any> => {
    const response = await api.get("/api/manager/orders", { params });
    return response;
  },

  getById: async (id: number): Promise<OrderDetailDto> => {
    const response = await api.get<OrderDetailDto>(`/api/manager/orders/${id}`);
    return response;
  },

  getByNumber: async (orderNumber: string): Promise<OrderDetailDto> => {
    const response = await api.get<OrderDetailDto>(
      `/api/manager/orders/by-number/${orderNumber}`
    );
    return response;
  },

  create: async (payload: CreateOrderPayload): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>(
      "/api/manager/orders",
      payload
    );
    return response;
  },

  updateStatus: async (
    id: number,
    payload: UpdateOrderStatusPayload
  ): Promise<void> => {
    await api.put(`/api/manager/orders/${id}/status`, payload);
  },

  cancel: async (id: number, payload: CancelOrderPayload): Promise<void> => {
    await api.post(`/api/manager/orders/${id}/cancel`, payload);
  },
};
