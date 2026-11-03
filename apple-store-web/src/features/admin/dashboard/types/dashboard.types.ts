export interface DashboardFilterParams {
  timeScope?: "today" | "yesterday" | "7days" | "30days" | "thisMonth";
  channelScope?: "all" | "online" | "cod";
}

export interface DashboardMetrics {
  ordersCount: number;
  ordersGrowthPercentage?: number | null;
  netRevenue: number;
  revenueGrowthPercentage?: number | null;
  estimatedRevenue: number;
  averageOrderValue: number;
  newUsersCount: number;
  activeUsersCount: number;
  retentionRate: number;
  activeSkusCount: number;
  lowStockSkusCount: number;
  totalProductsCount: number;
  activeProductsCount: number;
  totalCategoriesCount: number;
  activeCategoriesCount: number;
  totalSkusCount: number;
  totalStockQuantity: number;
}

export interface DashboardActionCenterData {
  pendingConfirmationCount: number;
  processingShippingCount: number;
  complaintsReturnsCount: number;
  paymentAlertsCount: number;
  delayedSlaCount: number;
}

export interface DailyRevenueTrend {
  date: string;
  dateLabel: string;
  revenue: number;
  ordersCount: number;
}

export interface StatusDistribution {
  status: string;
  statusName: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodDistribution {
  method: string;
  methodName: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface CustomerGrowthTrend {
  dateLabel: string;
  newCustomers: number;
  activeCustomers: number;
}

export interface CategoryDistribution {
  categoryId: number;
  categoryName: string;
  productsCount: number;
  variantsCount: number;
  totalStock: number;
  percentage: number;
}

export interface DashboardTrends {
  revenueTrends: DailyRevenueTrend[];
  statusDistribution: StatusDistribution[];
  paymentDistribution: PaymentMethodDistribution[];
  customerTrends: CustomerGrowthTrend[];
  categoryDistribution: CategoryDistribution[];
}

export interface TopSellingProduct {
  productName: string;
  sku: string;
  thumbnailUrl?: string | null;
  quantitySold: number;
  totalRevenue: number;
}

export interface LowStockProduct {
  productName: string;
  sku: string;
  quantityInStock: number;
  price: number;
}

export interface TopCustomer {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerType: string;
  ordersCount: number;
  totalSpent: number;
}

export interface RecentActivityOrder {
  id: number;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  totalAmount: number;
  status: string;
  statusName: string;
  paymentMethodName: string;
  paymentStatusName: string;
  placedAt: string;
}

export interface DashboardRankingsData {
  topSellingProducts: TopSellingProduct[];
  lowStockProducts: LowStockProduct[];
  topCustomers: TopCustomer[];
  recentOrders: RecentActivityOrder[];
}

