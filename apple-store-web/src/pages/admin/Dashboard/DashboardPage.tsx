import { useState } from "react";
import { Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";
import {
  DashboardFilters,
  DashboardMetricsCards,
  DashboardActionCenter,
  DashboardCharts,
  DashboardRankings,
  useDashboardMetrics,
  useDashboardActionCenter,
  useDashboardTrends,
  useDashboardRankings,
} from "@features/admin";
import type { DashboardFilterParams } from "@features/admin";

export const DashboardPage = () => {
  const [filters, setFilters] = useState<DashboardFilterParams>({
    timeScope: "30days",
  });

  const {
    data: metrics,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useDashboardMetrics(filters);

  const {
    data: actionCenter,
    isLoading: isActionCenterLoading,
    refetch: refetchActionCenter,
  } = useDashboardActionCenter();

  const {
    data: trends,
    isLoading: isTrendsLoading,
    refetch: refetchTrends,
  } = useDashboardTrends(filters);

  const {
    data: rankings,
    isLoading: isRankingsLoading,
    refetch: refetchRankings,
  } = useDashboardRankings(filters);

  const handleFilterChange = (newFilters: Partial<DashboardFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchMetrics(),
      refetchActionCenter(),
      refetchTrends(),
      refetchRankings(),
    ]);
    message.success("Đã làm mới dữ liệu tổng quan!");
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumbs={["TỔNG QUAN"]}
        title="Tổng quan hệ thống"
        subtitle="Theo dõi chỉ số kinh doanh, hàng đợi công việc khẩn cấp và xu hướng thời gian thực"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={
              isMetricsLoading ||
              isActionCenterLoading ||
              isTrendsLoading ||
              isRankingsLoading
            }
          >
            Làm mới
          </Button>
        }
      />

      <DashboardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onChange={handleFilterChange}
        onRefresh={handleRefresh}
        loading={
          isMetricsLoading ||
          isActionCenterLoading ||
          isTrendsLoading ||
          isRankingsLoading
        }
      />

      <DashboardMetricsCards
        metrics={metrics}
        isLoading={isMetricsLoading}
      />

      <DashboardActionCenter
        actionCenter={actionCenter}
        isLoading={isActionCenterLoading}
      />

      <DashboardCharts
        trends={trends}
        isLoading={isTrendsLoading}
      />

      <DashboardRankings
        topSellingProducts={rankings?.topSellingProducts || []}
        lowStockProducts={rankings?.lowStockProducts || []}
        topCustomers={rankings?.topCustomers || []}
        recentOrders={rankings?.recentOrders || []}
        isLoading={isRankingsLoading}
      />
    </div>
  );
};

export default DashboardPage;
