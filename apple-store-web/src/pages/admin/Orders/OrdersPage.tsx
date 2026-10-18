import { useState, useMemo } from "react";
import { Card, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";
import {
  OrdersTable,
  OrderDetailDrawer,
  OrderStatusModal,
  useOrders,
  useUpdateOrderStatus,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@features/admin";
import type {
  OrderSummaryDto,
  OrderPagedParams,
  UpdateOrderStatusPayload,
} from "@features/admin";

export const OrdersPage = () => {
  const [params, setParams] = useState<OrderPagedParams>({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    status: undefined,
    paymentStatus: undefined,
  });

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<OrderSummaryDto | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const { data, isLoading } = useOrders(params);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({
      ...prev,
      search: e.target.value,
      pageNumber: 1,
    }));
  };

  const handleStatusFilterChange = (value?: string) => {
    setParams((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      pageNumber: 1,
    }));
  };

  const handlePaymentFilterChange = (value?: string) => {
    setParams((prev) => ({
      ...prev,
      paymentStatus: value === "all" ? undefined : value,
      pageNumber: 1,
    }));
  };

  const handleViewDetail = (order: OrderSummaryDto) => {
    setSelectedOrderId(order.id);
    setDetailDrawerOpen(true);
  };

  const handleQuickStatus = (order: OrderSummaryDto) => {
    setSelectedOrderForStatus(order);
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (values: UpdateOrderStatusPayload) => {
    if (!selectedOrderForStatus) return;
    await updateStatusMutation.mutateAsync({
      id: selectedOrderForStatus.id,
      payload: values,
    });
    setStatusModalOpen(false);
    setSelectedOrderForStatus(null);
  };

  const paginationConfig = useMemo(() => {
    const meta = data?.meta?.cursorPagedResult;
    return {
      current: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      total: meta?.totalCount || (data ? data.length : 0),
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50"],
      showTotal: (total: number) => `Tổng cộng ${total} đơn hàng`,
      onChange: (page: number, size: number) => {
        setParams((prev) => ({
          ...prev,
          pageNumber: page,
          pageSize: size,
        }));
      },
    };
  }, [data, params]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          breadcrumbs={["BÁN HÀNG", "QUẢN TRỊ ĐƠN HÀNG"]}
          title="Quản Lý Đơn Hàng"
        />
      </div>

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <Input
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            placeholder="Tìm theo mã đơn, người nhận, số điện thoại..."
            value={params.search}
            onChange={handleSearchChange}
            allowClear
            className="w-full md:max-w-xs rounded-xl"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Select
              defaultValue="all"
              onChange={handleStatusFilterChange}
              className="w-full sm:w-44"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                ...ORDER_STATUS_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                })),
              ]}
            />

            <Select
              defaultValue="all"
              onChange={handlePaymentFilterChange}
              className="w-full sm:w-44"
              options={[
                { value: "all", label: "Tất cả thanh toán" },
                ...PAYMENT_STATUS_OPTIONS.map((p) => ({
                  value: p.value,
                  label: p.label,
                })),
              ]}
            />
          </div>
        </div>

        <OrdersTable
          data={data || []}
          loading={isLoading}
          pagination={paginationConfig}
          onViewDetail={handleViewDetail}
          onQuickStatus={handleQuickStatus}
        />
      </Card>

      <OrderDetailDrawer
        orderId={selectedOrderId}
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedOrderId(null);
        }}
      />

      <OrderStatusModal
        open={statusModalOpen}
        order={selectedOrderForStatus}
        onCancel={() => {
          setStatusModalOpen(false);
          setSelectedOrderForStatus(null);
        }}
        onSubmit={handleSaveStatus}
        loading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default OrdersPage;
