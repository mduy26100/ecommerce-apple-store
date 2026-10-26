export interface CreateOrderItemPayload {
  productVariantId?: number | null;
  productName: string;
  sku: string;
  variantName?: string | null;
  thumbnailUrl?: string | null;
  selectedAttributesJson?: string | null;
  colorName?: string | null;
  storageName?: string | null;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderPayload {
  userId?: number | null;
  guestId?: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  shippingAddressLine: string;
  shippingWard?: string | null;
  shippingDistrict?: string | null;
  shippingProvince: string;
  customerNote?: string | null;
  paymentMethod: string;
  shippingFee: number;
  voucherCode?: string | null;
  items: CreateOrderItemPayload[];
}

export interface OrderSuccessResponse {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  recipientEmail: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: string;
  placedAt: string;
}

export interface OrderItemDetail {
  id: number;
  orderId: number;
  productVariantId?: number | null;
  productName: string;
  sku: string;
  variantName?: string | null;
  thumbnailUrl?: string | null;
  selectedAttributesJson?: string | null;
  colorName?: string | null;
  storageName?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistoryItem {
  status: string;
  statusName: string;
  changedAt: string;
  actor: string;
  actorName?: string | null;
  note?: string | null;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  userId?: number | null;
  guestId?: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string | null;
  shippingAddressLine: string;
  shippingWard?: string | null;
  shippingDistrict?: string | null;
  shippingProvince: string;
  customerNote?: string | null;
  subtotal: number;
  shippingFee: number;
  voucherCode?: string | null;
  discountAmount: number;
  totalAmount: number;
  placedAt: string;
  shippingAddressUpdateCount?: number;
  canUpdateShippingAddress?: boolean;
  statusHistoryJson?: string | null;
  statusHistory?: OrderStatusHistoryItem[];
  items: OrderItemDetail[];
}

export interface UpdateShippingAddressPayload {
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string | null;
  shippingAddressLine: string;
  shippingWard?: string | null;
  shippingDistrict?: string | null;
  shippingProvince: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  userId?: number | null;
  guestId?: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string | null;
  shippingProvince: string;
  subtotal: number;
  shippingFee: number;
  voucherCode?: string | null;
  discountAmount: number;
  totalAmount: number;
  totalItems: number;
  placedAt: string;
}

export interface OrderLookupPayload {
  orderNumber: string;
  phoneOrEmail: string;
}

export interface ValidateVoucherPayload {
  voucherCode: string;
  subtotal: number;
  guestId?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface VoucherValidationResult {
  isValid: boolean;
  voucherId?: number | null;
  voucherCode?: string | null;
  voucherName?: string | null;
  discountType?: string | null;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  remainingUses?: number | null;
  message?: string | null;
}

export interface UserVoucher {
  id: number;
  voucherId: number;
  code: string;
  name: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  assignedUsageLimit: number;
  usedCount: number;
  remainingUses: number;
  expiresAt: string;
  isAvailable: boolean;
  targetType: string;
}

export interface PublicVoucher {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  remainingUses: number;
  perUserLimit: number;
  endDate: string;
}

export interface UserOrderPagedParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}
