import React from "react";
import { Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";

interface PaymentStatusBadgeProps {
  status: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const normalizedStatus = (status || "").toLowerCase();

  switch (normalizedStatus) {
    case "paid":
    case "success":
      return (
        <Tag
          data-testid="badge-payment-paid"
          icon={<CheckCircleOutlined />}
          color="success"
          className="px-2.5 py-0.5 rounded-full font-medium"
        >
          Đã thanh toán
        </Tag>
      );
    case "pending":
      return (
        <Tag
          data-testid="badge-payment-pending"
          icon={<ClockCircleOutlined />}
          color="warning"
          className="px-2.5 py-0.5 rounded-full font-medium"
        >
          Chưa thanh toán
        </Tag>
      );
    case "failed":
      return (
        <Tag
          data-testid="badge-payment-failed"
          icon={<CloseCircleOutlined />}
          color="error"
          className="px-2.5 py-0.5 rounded-full font-medium"
        >
          Thanh toán lỗi
        </Tag>
      );
    case "refunded":
      return (
        <Tag
          data-testid="badge-payment-refunded"
          icon={<SyncOutlined />}
          color="purple"
          className="px-2.5 py-0.5 rounded-full font-medium"
        >
          Đã hoàn tiền
        </Tag>
      );
    default:
      return (
        <Tag
          data-testid="badge-payment-default"
          color="default"
          className="px-2.5 py-0.5 rounded-full font-medium"
        >
          {status}
        </Tag>
      );
  }
};
