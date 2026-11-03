import { useState } from "react";
import { Tooltip } from "antd";
import {
  BarChartOutlined,
  CreditCardOutlined,
  UsergroupAddOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { OrderReportAnalytics } from "../types/order-report.types";

export interface OrderReportChartsProps {
  analytics?: OrderReportAnalytics;
  loading?: boolean;
}

type ChartTab = "trends" | "payments" | "customers" | "status" | "products";

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
  return `${amount} ₫`;
};

const formatNumber = (num: number = 0): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export const OrderReportCharts = ({ analytics, loading }: OrderReportChartsProps) => {
  const [activeTab, setActiveTab] = useState<ChartTab>("trends");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 h-96 animate-pulse" />
    );
  }

  const dailyTrends = analytics?.dailyTrends || [];
  const paymentMethods = analytics?.paymentMethods || [];
  const customerSegments = analytics?.customerSegments;
  const statusDistribution = analytics?.statusDistribution || [];
  const topSellingProducts = analytics?.topSellingProducts || [];
  const slowMovingProducts = analytics?.slowMovingProducts || [];
  const cashflowSummary = analytics?.cashflowSummary;
  const periodMetrics = analytics?.periodMetrics;

  const maxDailyRevenue = Math.max(
    ...dailyTrends.map((t) => Math.max(t.netRevenue, t.grossRevenue)),
    10_000_000
  );

  const totalPeriodNet = periodMetrics?.totalNetRevenue ?? 0;
  const totalPeriodGross = periodMetrics?.totalGrossRevenue ?? 0;
  const totalPeriodOrders = periodMetrics?.totalOrders ?? 0;
  const periodSuccessRate = periodMetrics?.successRate ?? 0;

  const vnpay = paymentMethods.find((p) => p.method === "VNPAY") || {
    method: "VNPAY",
    methodName: "VNPAY",
    totalOrders: 0,
    successfulOrders: 0,
    totalRevenue: 0,
    revenuePercentage: 0,
    successRate: 0,
    averageOrderValue: 0,
  };

  const cod = paymentMethods.find((p) => p.method === "COD") || {
    method: "COD",
    methodName: "Thanh toán khi nhận (COD)",
    totalOrders: 0,
    successfulOrders: 0,
    totalRevenue: 0,
    revenuePercentage: 0,
    successRate: 0,
    averageOrderValue: 0,
  };

  const totalPaymentRevenue = periodMetrics?.totalPaymentRevenue ?? 0;
  const vnpayRevPercent = periodMetrics?.vnpayPercentage ?? 0;
  const codRevPercent = periodMetrics?.codPercentage ?? 0;

  const totalCustomerRevenue = periodMetrics?.totalCustomerRevenue ?? 0;
  const memberOrdersRatio = periodMetrics?.memberOrdersRatio ?? 0;
  const guestOrdersRatio = periodMetrics?.guestOrdersRatio ?? 0;

  const safeCashflow = cashflowSummary?.safeCashflow ?? 0;
  const operatingCashflow = cashflowSummary?.operatingCashflow ?? 0;
  const lostCashflow = cashflowSummary?.lostCashflow ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Hệ Thống Biểu Đồ Phân Tích Đơn Hàng &amp; Dòng Tiền
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trực quan hóa đa chiều xu hướng doanh thu, hiệu suất kênh thanh toán và cơ cấu khách hàng
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg flex-wrap self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("trends")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "trends"
              ? "bg-white text-blue-600 border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <BarChartOutlined />
            <span>Xu hướng doanh thu kép</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "payments"
              ? "bg-white text-blue-600 border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <CreditCardOutlined />
            <span>Kênh VNPAY &amp; COD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "customers"
              ? "bg-white text-blue-600 border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <UsergroupAddOutlined />
            <span>Phân khúc khách hàng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "status"
              ? "bg-white text-blue-600 border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <PieChartOutlined />
            <span>Cơ cấu dòng tiền</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "products"
              ? "bg-white text-blue-600 border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <TrophyOutlined />
            <span>Top bán chạy &amp; Kén khách</span>
          </button>
        </div>
      </div>

      {activeTab === "trends" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tổng thực thu kỳ này
              </span>
              <span className="text-base font-bold text-blue-700 block mt-1">
                {formatCurrency(totalPeriodNet)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tổng phát sinh gộp
              </span>
              <span className="text-base font-bold text-slate-800 block mt-1">
                {formatCurrency(totalPeriodGross)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tổng số đơn phát sinh
              </span>
              <span className="text-base font-bold text-slate-800 block mt-1">
                {formatNumber(totalPeriodOrders)} đơn
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tỷ lệ chốt thành công
              </span>
              <span className="text-base font-bold text-emerald-600 block mt-1">
                {periodSuccessRate}%
              </span>
            </div>
          </div>

          <div className="min-h-10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 pt-1 gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1.5 font-semibold cursor-pointer">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                Doanh thu thực thu
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                <span className="w-3 h-3 rounded bg-slate-400 inline-block" />
                Doanh số gộp
              </span>
            </div>

            <div className="min-h-10 flex items-center justify-end">
              {(() => {
                const activeItem = hoveredIdx !== null ? dailyTrends[hoveredIdx] : (selectedIdx !== null ? dailyTrends[selectedIdx] : null);
                if (activeItem) {
                  return (
                    <div className="flex items-center gap-2 bg-slate-900 text-white text-xs px-3 py-1 rounded-lg border border-slate-700 shadow-sm shrink-0">
                      <span className="font-bold text-amber-300">Ngày {activeItem.formattedDate}:</span>
                      <span className="text-blue-300 font-semibold">Thực thu: <strong className="text-emerald-400 font-bold">{formatCurrency(activeItem.netRevenue)}</strong></span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-semibold">Gộp: <strong className="text-white font-bold">{formatCurrency(activeItem.grossRevenue)}</strong></span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{activeItem.totalOrders} đơn</span>
                    </div>
                  );
                }
                return (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                    <InfoCircleOutlined className="text-blue-600 text-xs" />
                    Rê chuột hoặc nhấp vào cột ngày để xem số tiền chi tiết
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-900 block text-xs">Doanh thu thực thu (Net Revenue):</strong>
                <span className="text-[11.5px] text-slate-500 leading-relaxed block mt-0.5">
                  Tổng giá trị tiền từ các đơn hàng giao dịch thành công (đơn Hoàn tất / Đã giao), phản ánh dòng tiền thực tế đã thu về của hệ thống.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-900 block text-xs">Doanh số gộp (Gross Revenue):</strong>
                <span className="text-[11.5px] text-slate-500 leading-relaxed block mt-0.5">
                  Tổng giá trị danh nghĩa của toàn bộ các đơn hàng đặt phát sinh trong kỳ (bao gồm đơn đang xử lý, chờ thanh toán, đang giao và đơn bị hủy/hoàn).
                </span>
              </div>
            </div>
          </div>

          {dailyTrends.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              Chưa có dữ liệu giao dịch trong khoảng thời gian này
            </div>
          ) : (
            <div className="relative pt-6 pb-2">
              <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[11px] font-semibold text-slate-400">
                  {formatShortCurrency(maxDailyRevenue)}
                </div>
                <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[11px] font-semibold text-slate-400">
                  {formatShortCurrency(maxDailyRevenue * 0.75)}
                </div>
                <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[11px] font-semibold text-slate-400">
                  {formatShortCurrency(maxDailyRevenue * 0.5)}
                </div>
                <div className="border-b border-slate-100 border-dashed w-full flex items-center justify-end pr-2 text-[11px] font-semibold text-slate-400">
                  {formatShortCurrency(maxDailyRevenue * 0.25)}
                </div>
                <div className="border-b border-slate-200 w-full flex items-center justify-end pr-2 text-[11px] font-semibold text-slate-400">
                  0 ₫
                </div>
              </div>

              <div className="relative z-10 h-64 w-full flex items-end gap-2 px-2 pr-16 overflow-x-auto custom-scrollbar">
                {dailyTrends.map((item, idx) => {
                  const netPercent = Math.max(
                    6,
                    Math.min(100, Math.round((item.netRevenue / maxDailyRevenue) * 100))
                  );
                  const grossPercent = Math.max(
                    6,
                    Math.min(100, Math.round((item.grossRevenue / maxDailyRevenue) * 100))
                  );
                  const isHovered = hoveredIdx === idx || selectedIdx === idx;

                  return (
                    <Tooltip
                      key={item.date}
                      placement="top"
                      color="#0f172a"
                      mouseEnterDelay={0.05}
                      mouseLeaveDelay={0.05}
                      arrow={{ pointAtCenter: true }}
                      title={
                        <div className="p-1 space-y-1.5 text-xs min-w-50">
                          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 flex items-center justify-between">
                            <span>Ngày {item.formattedDate}</span>
                            <span className="text-[11px] font-normal text-slate-400">{item.totalOrders} đơn hàng</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-0.5">
                            <span className="text-blue-300 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                              Thực thu:
                            </span>
                            <strong className="text-emerald-400 font-bold">{formatCurrency(item.netRevenue)}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                              Doanh số gộp:
                            </span>
                            <strong className="text-slate-200 font-bold">{formatCurrency(item.grossRevenue)}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between items-center">
                            <span>Thành công: <strong className="text-emerald-400">{item.successfulOrders}</strong> đơn</span>
                            <span>Hủy/Hoàn: <strong className="text-rose-400">{item.cancelledOrders}</strong> đơn</span>
                          </div>
                        </div>
                      }
                    >
                      <div
                        data-testid={`bar-${item.formattedDate.replace('/', '-')}`}
                        className={`w-11 sm:w-12 shrink-0 h-full flex flex-col items-center justify-end relative cursor-pointer rounded-lg p-0.5 transition-colors duration-150 ${isHovered ? "bg-slate-100" : "hover:bg-slate-50"
                          }`}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        onClick={() => setSelectedIdx(idx)}
                      >
                        <div className="h-48 w-full flex items-end justify-center gap-1 pb-1 cursor-pointer">
                          <div
                            style={{
                              height: item.netRevenue > 0 ? `${netPercent}%` : "0px",
                              minHeight: item.netRevenue > 0 ? "8px" : "0px",
                            }}
                            className={`w-2.5 sm:w-3 rounded-t cursor-pointer transition-colors duration-150 ${item.netRevenue > 0
                              ? isHovered ? "bg-blue-700" : "bg-blue-600"
                              : "opacity-0 pointer-events-none"
                              }`}
                          />
                          <div
                            style={{
                              height: item.grossRevenue > 0 ? `${grossPercent}%` : "0px",
                              minHeight: item.grossRevenue > 0 ? "8px" : "0px",
                            }}
                            className={`w-2.5 sm:w-3 rounded-t cursor-pointer transition-colors duration-150 ${item.grossRevenue > 0
                              ? isHovered ? "bg-slate-600" : "bg-slate-400"
                              : "opacity-0 pointer-events-none"
                              }`}
                          />
                        </div>

                        <span className={`text-[10px] mt-2 truncate w-full text-center shrink-0 cursor-pointer ${item.totalOrders > 0 ? "font-bold text-slate-900" : "text-slate-500"
                          }`}>
                          {item.formattedDate}
                        </span>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      VN
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Cổng Thanh Toán VNPAY</h4>
                      <span className="text-[11px] text-slate-500">Chuyển khoản trực tuyến &amp; QR Pay</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                    {vnpayRevPercent}% doanh thu
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200/60 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Doanh thu thực thu</span>
                    <span className="text-base font-bold text-blue-700">{formatCurrency(vnpay.totalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Giá trị TB / đơn (AOV)</span>
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(vnpay.averageOrderValue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tổng số đơn phát sinh</span>
                    <span className="text-sm font-bold text-slate-800">{vnpay.totalOrders} đơn</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tỷ lệ thanh toán thành công</span>
                    <span className="text-sm font-bold text-emerald-600">{vnpay.successRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                      COD
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Thanh Toán Khi Nhận Hàng (COD)</h4>
                      <span className="text-[11px] text-slate-500">Thu tiền mặt trực tiếp khi giao</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                    {codRevPercent}% doanh thu
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/60 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Doanh thu thực thu</span>
                    <span className="text-base font-bold text-amber-800">{formatCurrency(cod.totalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Giá trị TB / đơn (AOV)</span>
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(cod.averageOrderValue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tổng số đơn phát sinh</span>
                    <span className="text-sm font-bold text-slate-800">{cod.totalOrders} đơn</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tỷ lệ giao &amp; thu tiền xong</span>
                    <span className="text-sm font-bold text-emerald-600">{cod.successRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-800">Tỷ trọng đóng góp doanh thu theo kênh</span>
              <span className="text-slate-500">
                Tổng cộng: <strong className="text-slate-800">{formatCurrency(totalPaymentRevenue)}</strong>
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
              <div
                style={{ width: `${vnpayRevPercent}%` }}
                className="bg-blue-600 h-full flex items-center justify-center text-[10px] text-white font-bold"
              >
                {vnpayRevPercent > 10 ? `VNPAY ${vnpayRevPercent}%` : ""}
              </div>
              <div
                style={{ width: `${codRevPercent}%` }}
                className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
              >
                {codRevPercent > 10 ? `COD ${codRevPercent}%` : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Khách Hàng Thành Viên (Đã Đăng Ký)</h4>
                  <span className="text-[11px] text-slate-500">Tài khoản chính thức của Apple Store</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700">
                  {customerSegments?.memberPercentage || 0}% doanh thu
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-200/60 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Doanh thu thực thu</span>
                  <span className="text-base font-bold text-indigo-700">
                    {formatCurrency(customerSegments?.memberRevenue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Đơn giá TB (AOV)</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(customerSegments?.memberAov || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Số đơn hàng đặt</span>
                  <span className="text-sm font-bold text-slate-800">
                    {customerSegments?.memberOrders || 0} đơn
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tỷ trọng số lượng đơn</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {memberOrdersRatio}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Khách Hàng Vãng Lai (Mua Nhanh)</h4>
                  <span className="text-[11px] text-slate-500">Khách đặt hàng không cần tạo tài khoản</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-800">
                  {customerSegments?.guestPercentage || 0}% doanh thu
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Doanh thu thực thu</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(customerSegments?.guestRevenue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Đơn giá TB (AOV)</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(customerSegments?.guestAov || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Số đơn hàng đặt</span>
                  <span className="text-sm font-bold text-slate-800">
                    {customerSegments?.guestOrders || 0} đơn
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tỷ trọng số lượng đơn</span>
                  <span className="text-sm font-bold text-slate-700">
                    {guestOrdersRatio}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-800">Tỷ trọng doanh thu theo đối tượng khách hàng</span>
              <span className="text-slate-500">
                Tổng doanh số: <strong className="text-slate-800">{formatCurrency(totalCustomerRevenue)}</strong>
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
              <div
                style={{ width: `${customerSegments?.memberPercentage || 0}%` }}
                className="bg-indigo-600 h-full flex items-center justify-center text-[10px] text-white font-bold"
              >
                {(customerSegments?.memberPercentage || 0) > 10
                  ? `Thành viên ${customerSegments?.memberPercentage || 0}%`
                  : ""}
              </div>
              <div
                style={{ width: `${customerSegments?.guestPercentage || 0}%` }}
                className="bg-slate-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
              >
                {(customerSegments?.guestPercentage || 0) > 10
                  ? `Vãng lai ${customerSegments?.guestPercentage || 0}%`
                  : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "status" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <CheckCircleOutlined />
                <span>Dòng tiền thực thu hoàn tất</span>
              </div>
              <span className="text-lg font-bold text-emerald-700 block mt-2">
                {formatCurrency(safeCashflow)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Các đơn đã hoàn thành hoặc giao thành công
              </span>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <ClockCircleOutlined />
                <span>Dòng tiền đang xử lý / vận chuyển</span>
              </div>
              <span className="text-lg font-bold text-blue-700 block mt-2">
                {formatCurrency(operatingCashflow)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Đang giao hàng, chờ đóng gói hoặc chờ xác nhận
              </span>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <CloseCircleOutlined />
                <span>Dòng tiền thất thoát do hủy / hoàn</span>
              </div>
              <span className="text-lg font-bold text-rose-600 block mt-2">
                {formatCurrency(lostCashflow)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Đơn hủy hoặc khiếu nại hoàn trả sản phẩm
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Trạng thái đơn hàng</th>
                  <th className="p-3 text-right">Số lượng đơn</th>
                  <th className="p-3 text-right">Tỷ lệ cơ cấu</th>
                  <th className="p-3 text-right">Tổng giá trị đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statusDistribution.map((item) => (
                  <tr key={item.status} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">
                      {item.statusName}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-900">
                      {formatNumber(item.count)} đơn
                    </td>
                    <td className="p-3 text-right font-bold text-slate-700">
                      {item.percentage}%
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Top 10 Sản phẩm bán chạy nhất
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Theo số lượng bán
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="pb-2 w-8">#</th>
                        <th className="pb-2">Sản phẩm</th>
                        <th className="pb-2 text-right">Đã bán</th>
                        <th className="pb-2 text-right">Doanh thu</th>
                        <th className="pb-2 text-right">Còn tồn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topSellingProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            Chưa có dữ liệu bán hàng
                          </td>
                        </tr>
                      ) : (
                        topSellingProducts.map((p, idx) => (
                          <tr key={p.productId} className="hover:bg-slate-50">
                            <td className="py-2.5 font-bold text-slate-400">
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${idx === 0 ? "bg-amber-100 text-amber-800 font-black" :
                                idx === 1 ? "bg-slate-200 text-slate-700 font-bold" :
                                  idx === 2 ? "bg-orange-100 text-orange-800 font-bold" :
                                    "text-slate-500"
                                }`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 pr-2">
                              <div className="font-semibold text-slate-900 truncate max-w-50" title={p.productName}>
                                {p.productName}
                              </div>
                              <div className="text-[10px] text-slate-500">{p.categoryName || "Apple"}</div>
                            </td>
                            <td className="py-2.5 text-right font-bold text-slate-900">
                              {formatNumber(p.unitsSold)}
                            </td>
                            <td className="py-2.5 text-right font-bold text-emerald-700">
                              {formatCurrency(p.totalRevenue)}
                            </td>
                            <td className="py-2.5 text-right font-medium text-slate-600">
                              {formatNumber(p.currentStock)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Top 10 Sản phẩm kén khách (Tồn đọng)
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Tồn nhiều / Ít bán
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="pb-2 w-8">#</th>
                        <th className="pb-2">Sản phẩm</th>
                        <th className="pb-2 text-right">Đã bán</th>
                        <th className="pb-2 text-right">Tồn kho</th>
                        <th className="pb-2 text-right">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {slowMovingProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            Không có sản phẩm tồn đọng
                          </td>
                        </tr>
                      ) : (
                        slowMovingProducts.map((p, idx) => (
                          <tr key={p.productId} className="hover:bg-slate-50">
                            <td className="py-2.5 font-bold text-slate-400">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] text-slate-500">
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 pr-2">
                              <div className="font-semibold text-slate-900 truncate max-w-50" title={p.productName}>
                                {p.productName}
                              </div>
                              <div className="text-[10px] text-slate-500">{p.categoryName || "Apple"}</div>
                            </td>
                            <td className="py-2.5 text-right font-medium text-slate-500">
                              {p.unitsSold === 0 ? <span className="text-rose-600 font-bold">0</span> : formatNumber(p.unitsSold)}
                            </td>
                            <td className="py-2.5 text-right font-bold text-rose-700">
                              {formatNumber(p.currentStock)}
                            </td>
                            <td className="py-2.5 text-right font-medium text-slate-700">
                              {formatCurrency(p.price)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

