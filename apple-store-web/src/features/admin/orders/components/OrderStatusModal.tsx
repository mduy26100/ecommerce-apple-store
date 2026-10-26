import React, { useEffect } from "react";
import { Modal, Form, Select, Input } from "antd";
import type { OrderSummaryDto, OrderDetailDto, UpdateOrderStatusPayload } from "../types/order.types";

interface OrderStatusModalProps {
  open: boolean;
  order: OrderSummaryDto | OrderDetailDto | null;
  onCancel: () => void;
  onSubmit: (values: UpdateOrderStatusPayload) => void;
  loading?: boolean;
}

export const ORDER_STATUS_OPTIONS = [
  { value: "Pending", label: "Chờ xử lý", color: "gold" },
  { value: "Confirmed", label: "Đã xác nhận", color: "blue" },
  { value: "Processing", label: "Đang đóng gói", color: "cyan" },
  { value: "Shipping", label: "Đang giao hàng", color: "purple" },
  { value: "Delivered", label: "Đã giao hàng", color: "geekblue" },
  { value: "Completed", label: "Đã nhận hàng", color: "green" },
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
        note: undefined,
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

        <Form.Item name="note" label="Ghi chú tiến trình (Tùy chọn)">
          <Input.TextArea
            placeholder="Nhập ghi chú cho lần thay đổi trạng thái này (VD: Đã đóng gói, Bàn giao bưu tá)..."
            rows={2}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
