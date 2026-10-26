import { api } from "@core/api/axios.config";
import { ORDER_ENDPOINTS } from "../constants/order.endpoints";
import type {
  CreateOrderPayload,
  OrderSuccessResponse,
  OrderDetail,
  OrderSummary,
  OrderLookupPayload,
  ValidateVoucherPayload,
  VoucherValidationResult,
  UserVoucher,
  PublicVoucher,
  CancelOrderPayload,
  UserOrderPagedParams,
  UpdateShippingAddressPayload,
} from "../types/order.types";

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<OrderSuccessResponse> => {
    return await api.post<OrderSuccessResponse>(ORDER_ENDPOINTS.CREATE_ORDER, payload);
  },

  getMyOrders: async (params?: UserOrderPagedParams): Promise<OrderSummary[]> => {
    return await api.get<OrderSummary[]>(ORDER_ENDPOINTS.MY_ORDERS, { params });
  },

  getMyOrderDetail: async (id: number): Promise<OrderDetail> => {
    return await api.get<OrderDetail>(ORDER_ENDPOINTS.MY_ORDER_DETAIL(id));
  },

  getGuestRecentOrders: async (guestId: string): Promise<OrderSummary[]> => {
    return await api.get<OrderSummary[]>(ORDER_ENDPOINTS.GUEST_RECENT, {
      params: { guestId },
    });
  },

  lookupOrder: async (payload: OrderLookupPayload): Promise<OrderDetail> => {
    return await api.post<OrderDetail>(ORDER_ENDPOINTS.LOOKUP, payload);
  },

  getUnmergedGuestCount: async (guestId: string): Promise<{ count: number }> => {
    return await api.get<{ count: number }>(ORDER_ENDPOINTS.UNMERGED_GUEST_COUNT, {
      params: { guestId },
    });
  },

  mergeGuestOrders: async (guestId: string): Promise<{ mergedCount: number }> => {
    return await api.post<{ mergedCount: number }>(ORDER_ENDPOINTS.MERGE_GUEST, { guestId });
  },

  validateVoucher: async (payload: ValidateVoucherPayload): Promise<VoucherValidationResult> => {
    return await api.post<VoucherValidationResult>(ORDER_ENDPOINTS.VALIDATE_VOUCHER, payload);
  },

  getMyWallet: async (): Promise<UserVoucher[]> => {
    return await api.get<UserVoucher[]>(ORDER_ENDPOINTS.MY_WALLET);
  },

  getPublicVouchers: async (): Promise<PublicVoucher[]> => {
    return await api.get<PublicVoucher[]>(ORDER_ENDPOINTS.PUBLIC_VOUCHERS);
  },

  updateShippingAddress: async (id: number, payload: UpdateShippingAddressPayload): Promise<void> => {
    await api.put<void>(ORDER_ENDPOINTS.UPDATE_SHIPPING_ADDRESS(id), payload);
  },

  cancelOrder: async (id: number, payload: CancelOrderPayload): Promise<void> => {
    await api.post<void>(ORDER_ENDPOINTS.CANCEL(id), payload);
  },

  confirmReceived: async (id: number): Promise<void> => {
    await api.post<void>(ORDER_ENDPOINTS.CONFIRM_RECEIVED(id));
  },
};
