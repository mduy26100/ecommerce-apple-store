import { useState } from "react";
import { Tooltip } from "antd";
import type { DashboardTrends } from "../types/dashboard.types";
import { AppstoreOutlined } from "@ant-design/icons";

export interface DashboardChartsProps {
  trends?: DashboardTrends;
  loading?: boolean;
  isLoading?: boolean;
}

const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatShortCurrency = (amount: number = 0): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} tr`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} k`;
  }
  return `${amount}`;
};

const formatNumber = (num: number = 0): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export const DashboardCharts = ({ trends, loading, isLoading }: DashboardChartsProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isComponentLoading = loading || isLoading;
  if (isComponentLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 h-80 animate-pulse" />
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-80 animate-pulse" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 h-48 animate-pulse" />
      </div>
    );
  }

  const revenueTrends = trends?.revenueTrends || [];
  const statusDistribution = trends?.statusDistribution || [];
  const categoryDistribution = trends?.categoryDistribution || [];
  const paymentDistribution = (trends?.paymentDistribution || []).filter(
    (p) => p.method === "VNPAY" || p.method === "COD"
  );

  const maxRevenue = Math.max(...revenueTrends.map((t) => t.revenue), 10_000_000);
  const totalPaymentOrders = paymentDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Xu hướng doanh thu &amp; số đơn theo ngày
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doanh số thực tế và số lượng đơn hàng phát sinh trong kỳ theo dõi
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" />
                  Doanh thu (VND)
                </span>
              </div>
            </div>

            {revenueTrends.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs">
                Chưa có dữ liệu giao dịch trong khoảng thời gian này
              </div>
            ) : (
              <div className="relative pt-6 pb-2">
                <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[10px] text-slate-400">
                    {formatShortCurrency(maxRevenue)}
                  </div>
                  <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[10px] text-slate-400">
                    {formatShortCurrency(maxRevenue * 0.75)}
                  </div>
                  <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[10px] text-slate-400">
                    {formatShortCurrency(maxRevenue * 0.5)}
                  </div>
                  <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[10px] text-slate-400">
                    {formatShortCurrency(maxRevenue * 0.25)}
                  </div>
                  <div className="border-b border-slate-200 w-full flex items-center justify-end pr-2 text-[10px] text-slate-400">
                    0 ₫
                  </div>
                </div>

                <div className="relative z-10 h-60 w-full flex items-end gap-2 sm:gap-3 px-2 overflow-x-auto custom-scrollbar">
                  {revenueTrends.map((item, idx) => {
                    const heightPercent = Math.max(
                      6,
                      Math.min(100, Math.round((item.revenue / maxRevenue) * 100))
                    );
                    const isHovered = hoveredIdx === idx;

                    return (
                      <Tooltip
                        key={item.date}
                        placement="top"
                        color="#0f172a"
                        arrow={{ pointAtCenter: true }}
                        title={
                          <div className="p-1 space-y-1 text-xs">
                            <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 flex justify-between gap-3">
                              <span>Ngày {item.dateLabel}</span>
                              <span className="text-slate-400 font-normal">{item.ordersCount} đơn</span>
                            </div>
                            <div className="flex justify-between gap-3 pt-0.5">
                              <span className="text-blue-300 font-semibold">Doanh thu:</span>
                              <strong className="text-emerald-400 font-bold">{formatCurrency(item.revenue)}</strong>
                            </div>
                          </div>
                        }
                      >
                        <div
                          className="flex-1 min-w-[34px] sm:min-w-[44px] h-full flex flex-col items-center justify-end relative group cursor-pointer hover:bg-slate-50/80 rounded-lg p-0.5 transition-colors"
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-4 sm:w-6 rounded-t transition-all cursor-pointer ${
                              isHovered ? "bg-blue-700 shadow-sm" : "bg-blue-600"
                            }`}
                          />

                          <span className="text-[11px] text-slate-600 font-medium mt-2 truncate w-full text-center cursor-pointer">
                            {item.dateLabel}
                          </span>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Tỷ lệ trạng thái đơn hàng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân bổ cơ cấu đơn theo trạng thái xử lý
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {statusDistribution.map((item) => {
                let barColor = "bg-slate-400";
                if (item.status === "Completed") barColor = "bg-emerald-500";
                if (item.status === "Shipping") barColor = "bg-blue-500";
                if (item.status === "Processing") barColor = "bg-amber-500";
                if (item.status === "Cancelled") barColor = "bg-rose-500";

                return (
                  <div key={item.status} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{item.statusName}</span>
                      <span className="font-bold text-slate-900">
                        {item.count} đơn ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Kênh thanh toán (VNPAY &amp; COD)
              </span>
              <span className="text-xs text-slate-500">
                Tổng {totalPaymentOrders} giao dịch
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex mb-3">
              {paymentDistribution.map((p) => {
                const widthPct = totalPaymentOrders > 0 ? (p.count / totalPaymentOrders) * 100 : 0;
                const color = p.method === "VNPAY" ? "bg-blue-600" : "bg-emerald-600";
                return (
                  <div
                    key={p.method}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full ${color}`}
                  />
                );
              })}
            </div>

            <div className="space-y-2">
              {paymentDistribution.map((p) => {
                const isVnpay = p.method === "VNPAY";
                return (
                  <div
                    key={p.method}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isVnpay ? "bg-blue-600" : "bg-emerald-600"
                        }`}
                      />
                      <span className="font-semibold text-slate-800">
                        {isVnpay ? "Cổng VNPAY (Trực tuyến)" : "Thanh toán khi nhận (COD)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-600">
                        {p.count} đơn ({p.percentage}%)
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(p.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-slate-700" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Cơ cấu danh mục &amp; kho hàng toàn hệ thống
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổng quan thể loại mặt hàng, số mẫu mã, biến thể (SKU) và phân bổ số lượng tồn kho
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {categoryDistribution.length} Thể loại
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoryDistribution.map((cat) => (
            <div
              key={cat.categoryId}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">{cat.categoryName}</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {cat.percentage}% kho
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600 mb-3">
                <div className="flex justify-between">
                  <span>Số mẫu sản phẩm:</span>
                  <strong className="text-slate-800">{formatNumber(cat.productsCount)} mẫu</strong>
                </div>
                <div className="flex justify-between">
                  <span>Số mã biến thể:</span>
                  <strong className="text-slate-800">{formatNumber(cat.variantsCount)} SKU</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tồn kho hiện tại:</span>
                  <strong className="text-slate-900">{formatNumber(cat.totalStock)} cái</strong>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
