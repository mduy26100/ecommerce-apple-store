import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { message } from "antd";
import PageHeader from "@shared/components/page-header/PageHeader";
import {
  OrderReportKpiCards,
  OrderStatusBreakdown,
  OrderReportCharts,
  OrderReportFilters,
  ReportGlossary,
  useOrderReportSummary,
  useOrderStatusBreakdown,
  useOrderReportAnalytics,
  orderReportApi,
} from "@features/admin";
import type { OrderReportFilterParams } from "@features/admin";

const defaultDateRange = () => {
  return {
    fromDate: dayjs().subtract(29, "day").startOf("day").toISOString(),
    toDate: dayjs().endOf("day").toISOString(),
  };
};

export const ReportsPage = () => {
  const [filters, setFilters] = useState<OrderReportFilterParams>({
    ...defaultDateRange(),
    dateCriteria: "placed",
    status: undefined,
    paymentStatus: undefined,
    paymentMethod: undefined,
    pageNumber: 1,
    pageSize: 10,
  });

  const [isExporting, setIsExporting] = useState(false);

  const periodParams = useMemo<OrderReportFilterParams>(
    () => ({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      dateCriteria: filters.dateCriteria,
    }),
    [filters.fromDate, filters.toDate, filters.dateCriteria]
  );

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useOrderReportSummary(periodParams);

  const {
    data: breakdownData,
    isLoading: isBreakdownLoading,
    refetch: refetchBreakdown,
  } = useOrderStatusBreakdown(periodParams);

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useOrderReportAnalytics(filters);

  const handleFilterChange = (newFilters: Partial<OrderReportFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      ...defaultDateRange(),
      dateCriteria: "placed",
      status: undefined,
      paymentStatus: undefined,
      paymentMethod: undefined,
      pageNumber: 1,
      pageSize: 10,
    });
  };

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchBreakdown(), refetchAnalytics()]);
    message.success("Đã làm mới dữ liệu báo cáo!");
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      message.loading({ content: "Đang trích xuất toàn bộ dữ liệu đơn hàng theo tiêu chí từ máy chủ...", key: "export" });

      const fromDateFile = filters.fromDate ? dayjs(filters.fromDate).format("DD-MM-YYYY") : "Toan_Bo";
      const toDateFile = filters.toDate ? dayjs(filters.toDate).format("DD-MM-YYYY") : dayjs().format("DD-MM-YYYY");
      const fileName = `Bao_Cao_Don_Hang_Urban_Stitch_Tu_${fromDateFile}_Den_${toDateFile}.xlsx`;

      const blob = await orderReportApi.exportExcel(filters);

      if (!blob || blob.size === 0) {
        message.warning({ content: "Không có dữ liệu đơn hàng phù hợp tiêu chí để xuất file.", key: "export" });
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success({ content: `Xuất thành công file báo cáo chuẩn OpenXML "${fileName}"!`, key: "export" });
    } catch {
      message.error({ content: "Đã xảy ra lỗi khi trích xuất dữ liệu báo cáo từ máy chủ.", key: "export" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 sm:gap-5 pb-8 select-none">
      <PageHeader
        breadcrumbs={["BÁO CÁO & THỐNG KÊ"]}
        title="Báo Cáo Thống Kê Đơn Hàng"
      />

      <OrderReportKpiCards
        summary={summaryData}
        loading={isSummaryLoading}
      />

      <OrderStatusBreakdown
        breakdown={breakdownData}
        selectedStatus={filters.status}
        onSelectStatus={(status?: string) => handleFilterChange({ status, pageNumber: 1 })}
        loading={isBreakdownLoading}
      />

      <div className="space-y-4">
        <OrderReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onExportCsv={handleExportCsv}
          onRefresh={handleRefresh}
          loading={isSummaryLoading || isBreakdownLoading || isAnalyticsLoading || isExporting}
        />

        <OrderReportCharts
          analytics={analyticsData}
          loading={isAnalyticsLoading}
        />

        <ReportGlossary />
      </div>
    </div>
  );
};

export default ReportsPage;

