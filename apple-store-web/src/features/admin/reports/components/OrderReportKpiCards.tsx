import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { OrderKpiSummary } from "../types/order-report.types";

export interface OrderReportKpiCardsProps {
  summary?: OrderKpiSummary;
  loading?: boolean;
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

export const OrderReportKpiCards = ({ summary, loading }: OrderReportKpiCardsProps) => {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const revenue = summary?.totalRevenue || 0;
  const gross = summary?.totalGrossAmount || 0;
  const netGross = summary?.netGrossAmount || 0;
  const orders = summary?.totalOrders || 0;
  const customers = summary?.totalCustomers || 0;
  const successRate = summary?.successRate || 0;
  const cancelledRate = summary?.cancelledRate || 0;
  const aov = summary?.averageOrderValue || 0;
  const discount = summary?.totalDiscount || 0;

  const revGrowth = summary?.growthRevenuePercentage;
  const ordGrowth = summary?.growthOrdersPercentage;
  const custGrowth = summary?.growthCustomersPercentage;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
        <span className="text-xs font-semibold text-slate-500 truncate">
          Doanh Thu Thực Thu
        </span>
        <div className="my-2 min-w-0">
          <div data-testid="kpi-revenue-value" className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {formatCurrency(revenue)}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs truncate">
          {revGrowth !== null && revGrowth !== undefined ? (
            <>
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  revGrowth >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {revGrowth >= 0 ? <ArrowUpOutlined className="text-[10px]" /> : <ArrowDownOutlined className="text-[10px]" />}
                {revGrowth >= 0 ? `+${revGrowth}%` : `${revGrowth}%`}
              </span>
              <span className="text-slate-400">vs kỳ trước</span>
            </>
          ) : (
            <>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                Mới phát sinh
              </span>
              <span className="text-slate-400">kỳ trước: 0 ₫</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
        <span className="text-xs font-semibold text-slate-500 truncate">
          Doanh Số Gộp
        </span>
        <div className="my-2 min-w-0">
          <div data-testid="kpi-gross-value" className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {formatCurrency(gross)}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs truncate">
          {discount > 0 ? (
            <>
              <span className="font-semibold text-rose-600 truncate">
                -{formatCurrency(discount)}
              </span>
              <span className="text-slate-400">ưu đãi</span>
            </>
          ) : (
            <span className="text-slate-500 font-medium">Hiệu dụng: {formatCurrency(netGross)}</span>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
        <span className="text-xs font-semibold text-slate-500 truncate">
          Tổng Đơn Hàng
        </span>
        <div className="my-2 min-w-0">
          <div data-testid="kpi-orders-value" className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {formatNumber(orders)} <span className="text-xs font-medium text-slate-600">đơn</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs truncate">
          {ordGrowth !== null && ordGrowth !== undefined ? (
            <>
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  ordGrowth >= 0 ? "text-blue-600" : "text-rose-600"
                }`}
              >
                {ordGrowth >= 0 ? <ArrowUpOutlined className="text-[10px]" /> : <ArrowDownOutlined className="text-[10px]" />}
                {ordGrowth >= 0 ? `+${ordGrowth}%` : `${ordGrowth}%`}
              </span>
              <span className="text-slate-400">vs kỳ trước</span>
            </>
          ) : (
            <>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                Mới phát sinh
              </span>
              <span className="text-slate-400">kỳ trước: 0 đơn</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
        <span className="text-xs font-semibold text-slate-500 truncate">
          Tổng Khách Hàng
        </span>
        <div className="my-2 min-w-0">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {formatNumber(customers)} <span className="text-xs font-medium text-slate-600">khách</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs truncate">
          {custGrowth !== null && custGrowth !== undefined ? (
            <>
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  custGrowth >= 0 ? "text-indigo-600" : "text-rose-600"
                }`}
              >
                {custGrowth >= 0 ? <ArrowUpOutlined className="text-[10px]" /> : <ArrowDownOutlined className="text-[10px]" />}
                {custGrowth >= 0 ? `+${custGrowth}%` : `${custGrowth}%`}
              </span>
              <span className="text-slate-400">vs kỳ trước</span>
            </>
          ) : (
            <>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                Mới phát sinh
              </span>
              <span className="text-slate-400">kỳ trước: 0 khách</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
        <span className="text-xs font-semibold text-slate-500 truncate">
          Tỷ Lệ Thành Công
        </span>
        <div className="my-2 min-w-0">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600 tracking-tight truncate">
            {successRate}%
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs truncate">
          <span className="font-semibold text-rose-600">
            {cancelledRate}%
          </span>
          <span className="text-slate-400">hủy / hoàn</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
        <span className="text-xs font-semibold text-slate-500 truncate">
          Đơn Giá TB (AOV)
        </span>
        <div className="my-2 min-w-0">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {formatCurrency(aov)}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs truncate">
          <span className="font-semibold text-emerald-600">
            Miễn phí ship
          </span>
          <span className="text-slate-400">toàn quốc</span>
        </div>
      </div>
    </div>
  );
};

