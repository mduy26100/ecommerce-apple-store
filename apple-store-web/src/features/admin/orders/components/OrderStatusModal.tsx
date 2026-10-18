import React, { useEffect } from "react";
import { Modal, Form, Select } from "antd";
import type { OrderSummaryDto, UpdateOrderStatusPayload } from "../types/order.types";

interface OrderStatusModalProps {
  open: boolean;
  order: OrderSummaryDto | null;
  onCancel: () => void;
  onSubmit: (values: UpdateOrderStatusPayload) => void;
  loading?: boolean;
}

export const ORDER_STATUS_OPTIONS = [
  { value: "Pending", label: "Chờ xác nhận", color: "gold" },
  { value: "Confirmed", label: "Đã xác nhận", color: "blue" },
  { value: "Processing", label: "Đang đóng gói", color: "cyan" },
  { value: "Shipped", label: "Đang giao hàng", color: "purple" },
  { value: "Delivered", label: "Giao thành công", color: "green" },
  { value: "Cancelled", label: "Đã hủy đơn", color: "red" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "Pending", label: "Chưa thanh toán", color: "default" },
  { value: "Paid", label: "Đã thanh toán", color: "green" },
  { value: "Failed", label: "Thanh toán lỗi", color: "red" },
  { value: "Refunded", label: "Đã hoàn tiền", color: "orange" },
];

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  open,
  order,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && order) {
      form.setFieldsValue({
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
    }
  }, [open, order, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
    }
  };

  return (
    <Modal
      title={`Cập nhật trạng thái - Đơn #${order?.orderNumber}`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="status"
          label="Trạng thái đơn hàng"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái đơn hàng" }]}
        >
          <Select
            options={ORDER_STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>

        <Form.Item name="paymentStatus" label="Trạng thái thanh toán">
          <Select
            options={PAYMENT_STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
