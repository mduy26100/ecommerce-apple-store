import { Table, Tag, Button, Space } from "antd";
import { EyeOutlined, EditOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { OrderSummaryDto } from "../types/order.types";
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "./OrderStatusModal";

export interface OrdersTableProps {
  data: OrderSummaryDto[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  onViewDetail: (order: OrderSummaryDto) => void;
  onQuickStatus: (order: OrderSummaryDto) => void;
}

const formatCurrency = (val?: number | null) => {
  if (val == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("vi-VN");
};

export const OrdersTable = ({
  data,
  loading,
  pagination,
  onViewDetail,
  onQuickStatus,
}: OrdersTableProps) => {
  const columns: ColumnsType<OrderSummaryDto> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (code: string) => (
        <span className="font-mono font-bold text-blue-600 flex items-center gap-1">
          <FileTextOutlined className="text-slate-400" />
          <span>{code}</span>
        </span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-800">{record.recipientName}</div>
          <div className="text-xs text-slate-400 font-mono">{record.recipientPhone}</div>
        </div>
      ),
    },
    {
      title: "Tỉnh / Thành",
      dataIndex: "shippingProvince",
      key: "shippingProvince",
    },
    {
      title: "Số SP",
      dataIndex: "totalItems",
      key: "totalItems",
      align: "center",
      width: 80,
      render: (items: number) => (
        <span className="font-medium text-slate-700">{items}</span>
      ),
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount: number) => (
        <span className="font-bold text-rose-600 text-sm">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (payStatus: string) => {
        const conf = PAYMENT_STATUS_OPTIONS.find((p) => p.value === payStatus);
        return <Tag color={conf?.color || "default"}>{conf?.label || payStatus}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const conf = ORDER_STATUS_OPTIONS.find((s) => s.value === status);
        return <Tag color={conf?.color || "default"}>{conf?.label || status}</Tag>;
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "placedAt",
      key: "placedAt",
      render: (date: string) => (
        <span className="text-xs text-slate-500">{formatDate(date)}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
            className="text-blue-600 hover:bg-blue-50"
            title="Xem chi tiết đơn hàng"
            aria-label="Xem chi tiết đơn hàng"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onQuickStatus(record)}
            className="text-emerald-600 hover:bg-emerald-50"
            title="Đổi trạng thái"
            aria-label="Đổi trạng thái"
          />
        </Space>
      ),
    },
  ];

  return (
    <Table<OrderSummaryDto>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      scroll={{ x: "max-content" }}
      className="custom-scrollbar"
    />
  );
};
