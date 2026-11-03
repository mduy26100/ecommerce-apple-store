import type { OrderStatusBreakdownItem } from "../types/order-report.types";

export interface OrderStatusBreakdownProps {
  breakdown?: OrderStatusBreakdownItem[];
  selectedStatus?: string;
  onSelectStatus: (status?: string) => void;
  loading?: boolean;
}

const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusBadgeStyle = (status: string, isSelected: boolean) => {
  if (isSelected) {
    return "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600";
  }

  switch (status) {
    case "Completed":
    case "Delivered":
      return "border-emerald-200 bg-white hover:bg-emerald-50 text-slate-800";
    case "Shipping":
    case "Processing":
    case "Confirmed":
      return "border-blue-200 bg-white hover:bg-blue-50 text-slate-800";
    case "Pending":
      return "border-amber-200 bg-white hover:bg-amber-50 text-slate-800";
    case "Cancelled":
    case "Returned":
      return "border-rose-200 bg-white hover:bg-rose-50 text-slate-800";
    default:
      return "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
  }
};

const getDotColor = (status: string) => {
  switch (status) {
    case "Completed":
    case "Delivered":
      return "bg-emerald-500";
    case "Shipping":
    case "Processing":
    case "Confirmed":
      return "bg-blue-500";
    case "Pending":
      return "bg-amber-500";
    case "Cancelled":
    case "Returned":
      return "bg-rose-500";
    default:
      return "bg-slate-400";
  }
};

export const OrderStatusBreakdown = ({
  breakdown = [],
  selectedStatus,
  onSelectStatus,
  loading,
}: OrderStatusBreakdownProps) => {
  if (loading && breakdown.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Phân Bổ Toàn Bộ Trạng Thái Đơn Hàng
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Nhấp chọn trực tiếp từng trạng thái bên dưới để đối soát và lọc nhanh bảng dữ liệu.
          </p>
        </div>

        {selectedStatus && (
          <button
            type="button"
            onClick={() => onSelectStatus(undefined)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline text-left cursor-pointer flex items-center gap-1"
          >
            <span>✕ Bỏ lọc theo trạng thái</span>
            <span className="font-normal text-slate-500">
              (Đang xem: {breakdown.find((b) => b.status === selectedStatus)?.statusName || selectedStatus})
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {breakdown.map((item) => {
          const isSelected = selectedStatus === item.status;
          const badgeClass = getStatusBadgeStyle(item.status, isSelected);
          const dotColor = getDotColor(item.status);

          return (
            <button
              key={item.status}
              data-testid={`status-badge-${item.status}`}
              type="button"
              onClick={() => onSelectStatus(isSelected ? undefined : item.status)}
              className={`border rounded-lg p-2.5 text-left transition-colors flex flex-col justify-between cursor-pointer ${badgeClass}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                <span className="text-[11px] font-bold truncate">
                  {item.statusName}
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <span className="text-base font-bold text-slate-900">
                  {item.count}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {item.percentage}%
                </span>
              </div>

              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                {formatCurrency(item.totalAmount)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
