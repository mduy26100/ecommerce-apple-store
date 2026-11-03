import { useState } from "react";
import { DatePicker, Select, Button, message } from "antd";
import {
  ReloadOutlined,
  DownloadOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { OrderReportFilterParams } from "../types/order-report.types";

const { RangePicker } = DatePicker;

export interface OrderReportFiltersProps {
  filters: OrderReportFilterParams;
  onFilterChange?: (filters: Partial<OrderReportFilterParams>) => void;
  onChange?: (filters: Partial<OrderReportFilterParams>) => void;
  onReset?: () => void;
  onExportCsv?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

type QuickPreset = "today" | "yesterday" | "7days" | "30days" | "thisMonth" | "thisQuarter" | "custom";

export const OrderReportFilters = ({
  filters,
  onFilterChange,
  onChange,
  onReset,
  onExportCsv,
  onRefresh,
  loading = false,
}: OrderReportFiltersProps) => {
  const [activePreset, setActivePreset] = useState<QuickPreset>("30days");

  const handleUpdate = (changed: Partial<OrderReportFilterParams>) => {
    if (onFilterChange) {
      onFilterChange(changed);
    }
    if (onChange) {
      onChange(changed);
    }
  };

  const dateRangeValue: [Dayjs | null, Dayjs | null] = [
    filters.fromDate ? dayjs(filters.fromDate) : null,
    filters.toDate ? dayjs(filters.toDate) : null,
  ];

  const handleApplyQuickPreset = (preset: QuickPreset) => {
    setActivePreset(preset);
    const now = dayjs();
    let start: Dayjs;
    let end: Dayjs = now.endOf("day");

    switch (preset) {
      case "today":
        start = now.startOf("day");
        break;
      case "yesterday":
        start = now.subtract(1, "day").startOf("day");
        end = now.subtract(1, "day").endOf("day");
        break;
      case "7days":
        start = now.subtract(6, "day").startOf("day");
        break;
      case "30days":
        start = now.subtract(29, "day").startOf("day");
        break;
      case "thisMonth":
        start = now.startOf("month");
        break;
      case "thisQuarter": {
        const currentMonth = now.month();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        start = now.month(quarterStartMonth).startOf("month");
        break;
      }
      default:
        return;
    }

    handleUpdate({
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
      pageNumber: 1,
    });
  };

  const handleRangePickerChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      setActivePreset("custom");
      handleUpdate({
        fromDate: undefined,
        toDate: undefined,
        pageNumber: 1,
      });
      return;
    }

    const [start, end] = dates;
    const daysDiff = end.diff(start, "day");
    if (daysDiff > 365) {
      message.warning("Khoảng thời gian thống kê không được vượt quá 365 ngày.");
      return;
    }

    setActivePreset("custom");
    handleUpdate({
      fromDate: start.startOf("day").toISOString(),
      toDate: end.endOf("day").toISOString(),
      pageNumber: 1,
    });
  };

  const presetButtonClass = (preset: QuickPreset) => {
    const isActive = activePreset === preset;
    if (isActive) {
      return "h-8 px-2.5 text-xs font-semibold rounded-lg bg-blue-600 text-white border border-blue-600 transition-colors";
    }
    return "h-8 px-2.5 text-xs font-medium rounded-lg bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Mốc nhanh:
          </span>
          <button
            type="button"
            onClick={() => handleApplyQuickPreset("today")}
            className={presetButtonClass("today")}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => handleApplyQuickPreset("yesterday")}
            className={presetButtonClass("yesterday")}
          >
            Hôm qua
          </button>
          <button
            type="button"
            onClick={() => handleApplyQuickPreset("7days")}
            className={presetButtonClass("7days")}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            onClick={() => handleApplyQuickPreset("30days")}
            className={presetButtonClass("30days")}
          >
            30 ngày qua
          </button>
          <button
            type="button"
            onClick={() => handleApplyQuickPreset("thisMonth")}
            className={presetButtonClass("thisMonth")}
          >
            Tháng này
          </button>
          <button
            type="button"
            onClick={() => handleApplyQuickPreset("thisQuarter")}
            className={presetButtonClass("thisQuarter")}
          >
            Quý này
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onRefresh && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => onRefresh()}
              loading={loading}
              className="h-8 rounded-lg text-xs font-semibold border-slate-200 hover:border-slate-300"
            >
              Làm mới
            </Button>
          )}
          {onReset && (
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                setActivePreset("30days");
                onReset();
              }}
              className="h-8 rounded-lg text-xs font-semibold border-slate-200 hover:border-slate-300"
            >
              Đặt lại
            </Button>
          )}
          {onExportCsv && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => onExportCsv()}
              className="h-8 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            >
              Xuất báo cáo
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Khoảng thời gian tùy chỉnh
          </label>
          <RangePicker
            value={dateRangeValue}
            onChange={handleRangePickerChange}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            className="w-full h-9 rounded-lg border-slate-200 text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Tiêu chí ngày
          </label>
          <Select
            value={filters.dateCriteria || "placed"}
            onChange={(val) => handleUpdate({ dateCriteria: val, pageNumber: 1 })}
            className="w-full h-9 text-xs"
            options={[
              { value: "placed", label: "Theo ngày tạo đơn" },
              { value: "completed", label: "Theo ngày hoàn thành / thanh toán" },
            ]}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Trạng thái thanh toán
          </label>
          <Select
            value={filters.paymentStatus || "all"}
            onChange={(val) =>
              handleUpdate({ paymentStatus: val === "all" ? undefined : val, pageNumber: 1 })
            }
            className="w-full h-9 text-xs"
            options={[
              { value: "all", label: "Tất cả thanh toán" },
              { value: "Paid", label: "Đã thanh toán" },
              { value: "Pending", label: "Chờ thanh toán" },
              { value: "Failed", label: "Thất bại" },
              { value: "Refunded", label: "Đã hoàn tiền" },
            ]}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Phương thức thanh toán
          </label>
          <Select
            value={filters.paymentMethod || "all"}
            onChange={(val) =>
              handleUpdate({ paymentMethod: val === "all" ? undefined : val, pageNumber: 1 })
            }
            className="w-full h-9 text-xs"
            options={[
              { value: "all", label: "Tất cả phương thức" },
              { value: "COD", label: "Thanh toán khi nhận (COD)" },
              { value: "VNPAY", label: "VNPAY" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
