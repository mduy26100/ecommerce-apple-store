export interface OrderItemDto {
  id: number;
  orderId: number;
  productVariantId?: number | null;
  productName: string;
  sku: string;
  colorName?: string | null;
  storageName?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummaryDto {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  recipientName: string;
  recipientPhone: string;
  shippingProvince: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  totalItems: number;
  placedAt: string;
}

export interface OrderDetailDto {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddressLine: string;
  shippingWard?: string | null;
  shippingDistrict?: string | null;
  shippingProvince: string;
  customerNote?: string | null;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  placedAt: string;
  items: OrderItemDto[];
}

export interface OrderPagedParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
  paymentStatus?: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

export interface CreateOrderItemPayload {
  productVariantId?: number | null;
  productName: string;
  sku: string;
  colorName?: string | null;
  storageName?: string | null;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderPayload {
  userId: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddressLine: string;
  shippingWard?: string | null;
  shippingDistrict?: string | null;
  shippingProvince: string;
  customerNote?: string | null;
  paymentMethod?: string;
  shippingFee?: number;
  items: CreateOrderItemPayload[];
}
