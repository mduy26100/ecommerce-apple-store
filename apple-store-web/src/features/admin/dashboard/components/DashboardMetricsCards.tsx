import { ArrowUpOutlined, ArrowDownOutlined, AppstoreOutlined, ShoppingOutlined, DatabaseOutlined, AlertOutlined } from "@ant-design/icons";
import type { DashboardMetrics } from "../types/dashboard.types";

export interface DashboardMetricsCardsProps {
  metrics?: DashboardMetrics;
  loading?: boolean;
  isLoading?: boolean;
}

const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatNumber = (num: number = 0): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export const DashboardMetricsCards = ({ metrics, loading, isLoading }: DashboardMetricsCardsProps) => {
  const isComponentLoading = loading || isLoading;
  if (isComponentLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const ordersCount = metrics?.ordersCount || 0;
  const ordersGrowth = metrics?.ordersGrowthPercentage;
  const netRevenue = metrics?.netRevenue || 0;
  const revenueGrowth = metrics?.revenueGrowthPercentage;
  const estimatedRevenue = metrics?.estimatedRevenue || 0;
  const aov = metrics?.averageOrderValue || 0;
  const newUsers = metrics?.newUsersCount || 0;
  const activeUsers = metrics?.activeUsersCount || 0;
  const retentionRate = metrics?.retentionRate || 0;

  const totalProducts = metrics?.totalProductsCount || 0;
  const activeProducts = metrics?.activeProductsCount || 0;
  const totalCategories = metrics?.totalCategoriesCount || 0;
  const activeCategories = metrics?.activeCategoriesCount || 0;
  const totalSkus = metrics?.totalSkusCount || 0;
  const activeSkus = metrics?.activeSkusCount || 0;
  const totalStock = metrics?.totalStockQuantity || 0;
  const lowStockSkus = metrics?.lowStockSkusCount || 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 truncate">
            Doanh Thu Thực Thu
          </span>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(netRevenue)}
            </div>
          </div>
          {revenueGrowth !== null && revenueGrowth !== undefined ? (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  revenueGrowth >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {revenueGrowth >= 0 ? <ArrowUpOutlined className="text-[10px]" /> : <ArrowDownOutlined className="text-[10px]" />}
                {revenueGrowth >= 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`}
              </span>
              <span className="text-slate-400">vs kỳ trước</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                Mới phát sinh
              </span>
              <span className="text-slate-400">kỳ trước: 0 ₫</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 truncate">
            Tổng Đơn Hàng
          </span>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(ordersCount)} <span className="text-xs font-medium text-slate-600">đơn</span>
            </div>
          </div>
          {ordersGrowth !== null && ordersGrowth !== undefined ? (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  ordersGrowth >= 0 ? "text-blue-600" : "text-rose-600"
                }`}
              >
                {ordersGrowth >= 0 ? <ArrowUpOutlined className="text-[10px]" /> : <ArrowDownOutlined className="text-[10px]" />}
                {ordersGrowth >= 0 ? `+${ordersGrowth}%` : `${ordersGrowth}%`}
              </span>
              <span className="text-slate-400">vs kỳ trước</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                Mới phát sinh
              </span>
              <span className="text-slate-400">kỳ trước: 0 đơn</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 truncate">
            Đơn Giá TB (AOV)
          </span>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(aov)}
            </div>
          </div>
          <div className="text-xs text-slate-500 truncate">
            Ước tính: <span className="font-medium text-slate-700">{formatCurrency(estimatedRevenue)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 truncate">
            Khách Hàng Hoạt Động
          </span>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(activeUsers)} <span className="text-xs font-medium text-slate-600">khách</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Mới: <strong className="text-emerald-600">+{formatNumber(newUsers)}</strong></span>
            <span>Mua lại: <strong className="text-slate-800">{retentionRate}%</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Tổng Số Sản Phẩm
            </span>
            <ShoppingOutlined className="text-slate-400 text-sm" />
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(totalProducts)} <span className="text-xs font-medium text-slate-600">mẫu</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Đang mở bán: <span className="font-semibold text-emerald-600">{formatNumber(activeProducts)} sản phẩm</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Thể Loại Danh Mục
            </span>
            <AppstoreOutlined className="text-slate-400 text-sm" />
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(totalCategories)} <span className="text-xs font-medium text-slate-600">danh mục</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Đang hoạt động: <span className="font-semibold text-blue-600">{formatNumber(activeCategories)} nhóm</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Tổng Biến Thể (SKU)
            </span>
            <DatabaseOutlined className="text-slate-400 text-sm" />
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(totalSkus)} <span className="text-xs font-medium text-slate-600">SKU</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Mở bán: <span className="font-semibold text-slate-800">{formatNumber(activeSkus)} SKU</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Tổng Số Lượng Tồn Kho
            </span>
            <AlertOutlined className="text-slate-400 text-sm" />
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(totalStock)} <span className="text-xs font-medium text-slate-600">cái</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Cảnh báo tồn ít: <span className="font-semibold text-rose-600">{formatNumber(lowStockSkus)} SKU</span>
          </div>
        </div>
      </div>
    </div>
  );
};
