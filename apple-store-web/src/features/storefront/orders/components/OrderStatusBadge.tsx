import React from "react";
import { Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "pending":
      return (
        <Tag icon={<ClockCircleOutlined />} color="gold" className="px-2.5 py-0.5 rounded-full font-medium">
          Chờ xử lý
        </Tag>
      );
    case "confirmed":
      return (
        <Tag icon={<CheckCircleOutlined />} color="blue" className="px-2.5 py-0.5 rounded-full font-medium">
          Đã xác nhận
        </Tag>
      );
    case "processing":
      return (
        <Tag icon={<SyncOutlined spin />} color="cyan" className="px-2.5 py-0.5 rounded-full font-medium">
          Đang đóng gói
        </Tag>
      );
    case "shipping":
      return (
        <Tag icon={<CarOutlined />} color="purple" className="px-2.5 py-0.5 rounded-full font-medium">
          Đang giao hàng
        </Tag>
      );
    case "delivered":
      return (
        <Tag icon={<CarOutlined />} color="cyan" className="px-2.5 py-0.5 rounded-full font-medium">
          Đã giao hàng
        </Tag>
      );
    case "completed":
      return (
        <Tag icon={<CheckCircleOutlined />} color="success" className="px-2.5 py-0.5 rounded-full font-medium">
          Đã nhận hàng
        </Tag>
      );
    case "cancelled":
      return (
        <Tag icon={<CloseCircleOutlined />} color="error" className="px-2.5 py-0.5 rounded-full font-medium">
          Đã hủy
        </Tag>
      );
    default:
      return (
        <Tag color="default" className="px-2.5 py-0.5 rounded-full font-medium">
          {status}
        </Tag>
      );
  }
};
