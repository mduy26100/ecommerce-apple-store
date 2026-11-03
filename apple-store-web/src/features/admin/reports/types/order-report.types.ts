export interface OrderReportFilterParams {
  fromDate?: string;
  toDate?: string;
  dateCriteria?: "placed" | "completed";
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface OrderKpiSummary {
  totalRevenue: number;
  totalGrossAmount: number;
  netGrossAmount: number;
  totalOrders: number;
  totalCustomers: number;
  successRate: number;
  cancelledRate: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalShippingFee: number;
  growthRevenuePercentage?: number | null;
  growthOrdersPercentage?: number | null;
  growthCustomersPercentage?: number | null;
  previousRevenue: number;
  previousOrders: number;
  previousCustomers: number;
}

export interface OrderStatusBreakdownItem {
  status: string;
  statusName: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface OrderReportItem {
  id: number;
  productName: string;
  sku: string;
  variantName?: string | null;
  colorName?: string | null;
  storageName?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  thumbnailUrl?: string | null;
}

export interface OrderReportDetail {
  id: number;
  orderNumber: string;
  userId?: number | null;
  guestId?: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string | null;
  customerType: string;
  shippingProvince: string;
  shippingAddressLine: string;
  status: string;
  statusName: string;
  paymentStatus: string;
  paymentStatusName: string;
  paymentMethod: string;
  paymentMethodName: string;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  voucherCode?: string | null;
  shippingFee: number;
  vatAmount: number;
  totalAmount: number;
  placedAt: string;
  completedAt?: string | null;
  items: OrderReportItem[];
}

export interface CursorPagedResult {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderReportPagedData {
  items: OrderReportDetail[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface DailyOrderTrend {
  date: string;
  formattedDate: string;
  netRevenue: number;
  grossRevenue: number;
  totalOrders: number;
  successfulOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export interface PaymentMethodAnalytics {
  method: string;
  methodName: string;
  totalOrders: number;
  successfulOrders: number;
  totalRevenue: number;
  revenuePercentage: number;
  successRate: number;
  averageOrderValue: number;
}

export interface CustomerSegmentAnalytics {
  memberOrders: number;
  memberRevenue: number;
  memberAov: number;
  memberPercentage: number;
  guestOrders: number;
  guestRevenue: number;
  guestAov: number;
  guestPercentage: number;
}

export interface OrderStatusAnalytics {
  status: string;
  statusName: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface ReportTopSellingProduct {
  productId: number;
  productName: string;
  categoryName?: string | null;
  unitsSold: number;
  totalRevenue: number;
  currentStock: number;
}

export interface ReportSlowMovingProduct {
  productId: number;
  productName: string;
  categoryName?: string | null;
  unitsSold: number;
  currentStock: number;
  price: number;
}

export interface CashflowSummary {
  safeCashflow: number;
  operatingCashflow: number;
  lostCashflow: number;
}

export interface PeriodMetrics {
  totalNetRevenue: number;
  totalGrossRevenue: number;
  netGrossRevenue: number;
  totalOrders: number;
  successfulOrders: number;
  successRate: number;
  totalPaymentRevenue: number;
  vnpayPercentage: number;
  codPercentage: number;
  totalCustomerOrders: number;
  totalCustomerRevenue: number;
  memberOrdersRatio: number;
  guestOrdersRatio: number;
}

export interface OrderReportAnalytics {
  dailyTrends: DailyOrderTrend[];
  paymentMethods: PaymentMethodAnalytics[];
  customerSegments: CustomerSegmentAnalytics;
  statusDistribution: OrderStatusAnalytics[];
  topSellingProducts: ReportTopSellingProduct[];
  slowMovingProducts: ReportSlowMovingProduct[];
  cashflowSummary?: CashflowSummary;
  periodMetrics?: PeriodMetrics;
}

export interface OrderTrendsReport {
  dailyTrends: DailyOrderTrend[];
  periodMetrics: PeriodMetrics;
}

export interface PaymentMethodsReport {
  paymentMethods: PaymentMethodAnalytics[];
  totalPaymentRevenue: number;
  vnpayPercentage: number;
  codPercentage: number;
}

export interface CustomerSegmentsReport {
  customerSegments: CustomerSegmentAnalytics;
  totalCustomerOrders: number;
  totalCustomerRevenue: number;
  memberOrdersRatio: number;
  guestOrdersRatio: number;
}

export interface CashflowReport {
  cashflowSummary: CashflowSummary;
  statusDistribution: OrderStatusAnalytics[];
}

export interface ProductPerformanceReport {
  topSellingProducts: ReportTopSellingProduct[];
  slowMovingProducts: ReportSlowMovingProduct[];
}
