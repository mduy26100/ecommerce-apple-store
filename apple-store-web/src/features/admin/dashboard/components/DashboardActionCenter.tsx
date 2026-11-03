import { Link } from "react-router-dom";
import {
  ClockCircleOutlined,
  InboxOutlined,
  RollbackOutlined,
  AlertOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { DashboardActionCenterData } from "../types/dashboard.types";

export interface DashboardActionCenterProps {
  actionCenter?: DashboardActionCenterData;
  loading?: boolean;
  isLoading?: boolean;
}

export const DashboardActionCenter = ({ actionCenter, loading, isLoading }: DashboardActionCenterProps) => {
  const isComponentLoading = loading || isLoading;
  if (isComponentLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="h-4 w-52 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const pending = actionCenter?.pendingConfirmationCount || 0;
  const processing = actionCenter?.processingShippingCount || 0;
  const complaints = actionCenter?.complaintsReturnsCount || 0;
  const paymentAlerts = actionCenter?.paymentAlertsCount || 0;
  const delayedSla = actionCenter?.delayedSlaCount || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
            Hàng đợi công việc khẩn cấp
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Các đầu việc ưu tiên cần đội ngũ vận hành xử lý ngay trong ca trực
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Xem tất cả đơn hàng &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <Link
          to="/admin/orders?status=Pending"
          className="p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-base">
              <ClockCircleOutlined />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition-colors">
                Cần xác nhận
              </span>
              <span className="text-[11px] text-slate-500">Đơn mới đặt</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-amber-600">{pending}</span>
        </Link>

        <Link
          to="/admin/orders?status=Processing"
          className="p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between sm:pl-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
              <InboxOutlined />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition-colors">
                Đóng gói & Giao vận
              </span>
              <span className="text-[11px] text-slate-500">Chờ xuất kho</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-blue-600">{processing}</span>
        </Link>

        <Link
          to="/admin/orders?status=Returned"
          className="p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between sm:pl-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-base">
              <RollbackOutlined />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition-colors">
                Khiếu nại / Trả hàng
              </span>
              <span className="text-[11px] text-slate-500">Hủy & Đổi trả</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-purple-600">{complaints}</span>
        </Link>

        <Link
          to="/admin/orders?paymentStatus=Failed"
          className="p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between sm:pl-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-base">
              <AlertOutlined />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition-colors">
                Lỗi thanh toán
              </span>
              <span className="text-[11px] text-slate-500">Cần đối soát</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-rose-600">{paymentAlerts}</span>
        </Link>

        <div className="p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between sm:pl-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-base">
              <WarningOutlined />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Trễ hạn SLA
              </span>
              <span className="text-[11px] text-slate-500">&gt; 48h chưa giao</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-red-600">{delayedSla}</span>
        </div>
      </div>
    </div>
  );
};
