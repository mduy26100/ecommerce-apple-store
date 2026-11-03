import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { DashboardFilterParams } from "../types/dashboard.types";

export interface DashboardFiltersProps {
  filters: DashboardFilterParams;
  onFilterChange?: (filters: Partial<DashboardFilterParams>) => void;
  onChange?: (filters: Partial<DashboardFilterParams>) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const DashboardFilters = ({
  filters,
  onFilterChange,
  onChange,
  onRefresh,
  loading = false,
}: DashboardFiltersProps) => {
  const timeScopes = [
    { value: "today", label: "Hôm nay" },
    { value: "yesterday", label: "Hôm qua" },
    { value: "7days", label: "7 ngày qua" },
    { value: "30days", label: "30 ngày qua" },
    { value: "thisMonth", label: "Tháng này" },
  ];

  const handleUpdate = (changed: Partial<DashboardFilterParams>) => {
    if (onFilterChange) {
      onFilterChange(changed);
    }
    if (onChange) {
      onChange(changed);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
          Mốc thời gian:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {timeScopes.map((scope) => {
            const isActive = (filters.timeScope || "30days") === scope.value;
            return (
              <button
                key={scope.value}
                type="button"
                onClick={() => handleUpdate({ timeScope: scope.value as any })}
                className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {scope.label}
              </button>
            );
          })}
        </div>
      </div>

      {onRefresh && (
        <Button
          icon={<ReloadOutlined />}
          onClick={() => onRefresh()}
          loading={loading}
          className="h-8 rounded-lg text-xs font-semibold border-slate-200 hover:border-slate-300 self-end sm:self-auto"
        >
          Làm mới
        </Button>
      )}
    </div>
  );
};
