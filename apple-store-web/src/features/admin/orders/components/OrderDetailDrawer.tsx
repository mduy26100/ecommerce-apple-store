import React, { useState } from "react";
import {
  Drawer,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Popconfirm,
  Spin,
  Divider,
  Timeline,
} from "antd";
import {
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useOrderDetail, useUpdateOrderStatus, useCancelOrder } from "../hooks/useOrders";
import type { OrderItemDto, UpdateOrderStatusPayload } from "../types/order.types";
import { OrderStatusModal, ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "./OrderStatusModal";

interface OrderDetailDrawerProps {
  orderId: number | null;
  open: boolean;
  onClose: () => void;
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

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  orderId,
  open,
  onClose,
}) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const { data: order, isLoading } = useOrderDetail(orderId || undefined);
  const updateStatusMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();

  const handleUpdateStatus = async (values: UpdateOrderStatusPayload) => {
    if (!order) return;
    await updateStatusMutation.mutateAsync({
      id: order.id,
      payload: values,
    });
    setStatusModalOpen(false);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    await cancelMutation.mutateAsync({
      id: order.id,
      payload: { reason: "Khách hàng yêu cầu hủy từ bảng quản trị" },
    });
  };

  const statusConfig = ORDER_STATUS_OPTIONS.find((s) => s.value === order?.status);
  const paymentConfig = PAYMENT_STATUS_OPTIONS.find((p) => p.value === order?.paymentStatus);

  const itemColumns: ColumnsType<OrderItemDto> = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (name: string, record) => (
        <div>
          <div className="font-semibold text-slate-800">{name}</div>
          <div className="text-xs text-slate-500 font-mono">SKU: {record.sku}</div>
          {(record.colorName || record.storageName) && (
            <div className="text-xs text-blue-600 mt-0.5">
              {[record.colorName, record.storageName].filter(Boolean).join(" - ")}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (price: number) => <span>{formatCurrency(price)}</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 90,
      render: (qty: number) => <span className="font-semibold">{qty}</span>,
    },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right",
      render: (total: number) => (
        <span className="font-semibold text-rose-600">
          {formatCurrency(total)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center justify-between pr-4">
            <div>
              <span className="text-lg font-bold text-slate-800">
                Chi tiết đơn hàng #{order?.orderNumber}
              </span>
              {order && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Ngày đặt: {formatDate(order.placedAt)}
                </div>
              )}
            </div>
            {order && (
              <Space>
                <Tag color={statusConfig?.color || "default"} className="text-sm px-2.5 py-1">
                  {statusConfig?.label || order.status}
                </Tag>
              </Space>
            )}
          </div>
        }
        open={open}
        onClose={onClose}
        width={850}
        destroyOnClose
      >
        {isLoading || !order ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">
                  Thanh toán:
                </span>
                <Tag color={paymentConfig?.color || "default"}>
                  {paymentConfig?.label || order.paymentStatus}
                </Tag>
                <span className="text-xs text-slate-500">
                  ({order.paymentMethod})
                </span>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setStatusModalOpen(true)}
                >
                  Cập nhật trạng thái
                </Button>
                {order.status !== "Cancelled" && order.status !== "Delivered" && order.paymentStatus !== "Paid" && (
                  <Popconfirm
                    title="Xác nhận hủy đơn hàng"
                    description="Đơn hàng sẽ được chuyển sang Đã hủy và toàn bộ số lượng sẽ được hoàn lại kho."
                    onConfirm={handleCancelOrder}
                    okText="Xác nhận hủy"
                    cancelText="Đóng"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      icon={<StopOutlined />}
                      loading={cancelMutation.isPending}
                    >
                      Hủy đơn hàng
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </div>

            <Descriptions
              title="Thông tin nhận hàng"
              bordered
              size="small"
              column={{ xs: 1, sm: 2 }}
            >
              <Descriptions.Item label="Người nhận">
                <span className="font-semibold text-slate-800">
                  {order.recipientName}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <span className="font-mono text-slate-700">
                  {order.recipientPhone}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao" span={2}>
                {[
                  order.shippingAddressLine,
                  order.shippingWard,
                  order.shippingDistrict,
                  order.shippingProvince,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Descriptions.Item>
              {order.customerNote && (
                <Descriptions.Item label="Ghi chú đơn hàng" span={2}>
                  <span className="text-amber-800 italic">
                    {order.customerNote}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-slate-800 mb-3">
                  Lịch sử thay đổi trạng thái
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <Timeline
                    items={order.statusHistory.map((h) => ({
                      children: (
                        <div className="text-xs">
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <span>{h.statusName || h.status}</span>
                            <span className="text-slate-400 font-normal">
                              ({h.actor === "Customer" ? "Khách hàng" : h.actor === "Manager" ? "Quản trị viên" : h.actor})
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {formatDate(h.changedAt)}
                          </div>
                          {h.note && (
                            <div className="text-slate-600 mt-1 italic">
                              "{h.note}"
                            </div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </div>
              </div>
            )}

            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-3">
                Snapshot sản phẩm khi đặt ({order.items.length} mặt hàng)
              </h4>
              <Table
                dataSource={order.items}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
              />
            </div>

            <Divider />

            <div className="flex justify-end">
              <div className="w-72 space-y-2 text-right">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tạm tính:</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Phí giao hàng:</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(order.shippingFee)}
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-lg text-rose-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {order && (
        <OrderStatusModal
          open={statusModalOpen}
          order={order}
          onCancel={() => setStatusModalOpen(false)}
          onSubmit={handleUpdateStatus}
          loading={updateStatusMutation.isPending}
        />
      )}
    </>
  );
};
