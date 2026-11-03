import { useState } from "react";
import { Table, Tag, Button, Drawer } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { OrderReportDetail } from "../types/order-report.types";

export interface OrderReportTableProps {
  data: OrderReportDetail[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
}

const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const getOrderStatusTag = (status: string, statusName: string) => {
  switch (status) {
    case "Completed":
    case "Delivered":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {statusName}
        </span>
      );
    case "Shipping":
    case "Processing":
    case "Confirmed":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          {statusName}
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {statusName}
        </span>
      );
    case "Cancelled":
    case "Returned":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {statusName}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {statusName}
        </span>
      );
  }
};

const getPaymentStatusTag = (paymentStatus: string, paymentStatusName: string) => {
  switch (paymentStatus) {
    case "Paid":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {paymentStatusName}
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {paymentStatusName}
        </span>
      );
    case "Failed":
    case "Refunded":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {paymentStatusName}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {paymentStatusName}
        </span>
      );
  }
};

export const OrderReportTable = ({
  data,
  loading,
  pagination,
}: OrderReportTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderReportDetail | null>(null);

  const columns: ColumnsType<OrderReportDetail> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 170,
      fixed: "left",
      render: (orderNumber: string, record: OrderReportDetail) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-900 text-xs tracking-tight">
            {orderNumber}
          </span>
          <span className="text-[10px] text-slate-500">
            {record.customerType === "Thành viên" ? (
              <Tag color="blue" className="border-none font-semibold text-[10px] m-0 px-1.5 py-0">
                Thành viên
              </Tag>
            ) : (
              <Tag className="border-slate-200 font-semibold text-[10px] m-0 px-1.5 py-0 text-slate-500 bg-slate-50">
                Khách vãng lai
              </Tag>
            )}
          </span>
        </div>
      ),
    },
    {
      title: "Khách hàng & Liên hệ",
      key: "recipient",
      width: 180,
      render: (_: unknown, record: OrderReportDetail) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-xs">
            {record.recipientName}
          </span>
          <span className="text-slate-700 font-medium text-xs mt-0.5">
            {record.recipientPhone}
          </span>
          {record.recipientEmail && (
            <span className="text-slate-600 text-[11px] truncate max-w-[170px]">
              {record.recipientEmail}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Tỉnh / Thành",
      dataIndex: "shippingProvince",
      key: "shippingProvince",
      width: 130,
      render: (province: string) => (
        <span className="text-slate-800 text-xs font-semibold">
          {province || "-"}
        </span>
      ),
    },
    {
      title: "Thời gian",
      key: "timestamps",
      width: 160,
      render: (_: unknown, record: OrderReportDetail) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-800 font-medium">
            Đặt: {formatDate(record.placedAt)}
          </span>
          {record.completedAt && (
            <span className="text-slate-600 text-[11px] mt-0.5">
              Cập nhật: {formatDate(record.completedAt)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Mặt hàng",
      key: "items",
      width: 200,
      render: (_: unknown, record: OrderReportDetail) => {
        const firstItem = record.items?.[0];
        const extraCount = (record.items?.length || 0) - 1;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-slate-800 truncate">
              {firstItem?.productName || "Sản phẩm Apple"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
              <span>{record.totalItems} sản phẩm</span>
              {extraCount > 0 && (
                <span className="text-[10px] text-slate-400">
                  (+{extraCount} món khác)
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Tạm tính & Giảm giá",
      key: "subtotalAndDiscount",
      width: 170,
      render: (_: unknown, record: OrderReportDetail) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-700 font-medium">
            {formatCurrency(record.subtotal)}
          </span>
          {record.discountAmount > 0 && (
            <span className="text-rose-600 text-[11px] font-semibold mt-0.5">
              -{formatCurrency(record.discountAmount)}{" "}
              {record.voucherCode && `(${record.voucherCode})`}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Thực thu",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount: number) => (
        <span className="font-bold text-slate-900 text-sm">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethodName",
      key: "paymentMethodName",
      width: 150,
      render: (methodName: string) => (
        <span className="text-slate-900 text-xs font-semibold">
          {methodName}
        </span>
      ),
    },
    {
      title: "Thanh toán",
      key: "paymentStatus",
      width: 130,
      render: (_: unknown, record: OrderReportDetail) =>
        getPaymentStatusTag(record.paymentStatus, record.paymentStatusName),
    },
    {
      title: "Trạng thái đơn",
      key: "status",
      width: 140,
      render: (_: unknown, record: OrderReportDetail) =>
        getOrderStatusTag(record.status, record.statusName),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      fixed: "right",
      render: (_: unknown, record: OrderReportDetail) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setSelectedOrder(record)}
          aria-label="Xem chi tiết đơn hàng"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold h-8 px-2"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          scroll={{ x: 1400 }}
          className="custom-scrollbar"
        />
      </div>

      <Drawer
        title="Chi Tiết Đơn Hàng Đối Soát"
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        width={680}
      >
        {selectedOrder && (
          <div className="flex flex-col gap-5 text-slate-800 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  {selectedOrder.orderNumber}
                </span>
                <div>
                  {getOrderStatusTag(selectedOrder.status, selectedOrder.statusName)}
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                <span>Đặt ngày: {formatDate(selectedOrder.placedAt)}</span>
                <span>Thanh toán: {selectedOrder.paymentMethodName}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Thông tin người nhận
              </span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Họ và tên</span>
                  <span className="font-semibold">{selectedOrder.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số điện thoại</span>
                  <span className="font-semibold">{selectedOrder.recipientPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Địa chỉ giao nhận</span>
                  <span>
                    {selectedOrder.shippingAddressLine}, {selectedOrder.shippingProvince}
                  </span>
                </div>
                {selectedOrder.recipientEmail && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span>{selectedOrder.recipientEmail}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px]">Loại tài khoản</span>
                  <span>{selectedOrder.customerType}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                Danh sách sản phẩm trong đơn ({selectedOrder.items?.length || 0})
              </span>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2.5">Sản phẩm</th>
                      <th className="p-2.5 text-center">SL</th>
                      <th className="p-2.5 text-right">Đơn giá</th>
                      <th className="p-2.5 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <div className="font-bold text-slate-800">
                            {item.productName}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            SKU: {item.sku}
                            {item.colorName ? ` • ${item.colorName}` : ""}
                            {item.storageName ? ` • ${item.storageName}` : ""}
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-semibold">
                          {item.quantity}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Tổng kết tài chính
              </span>
              <div className="flex justify-between items-center text-slate-600 pt-1">
                <span>Tạm tính hàng hóa:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedOrder.subtotal)}
                </span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between items-center text-rose-600">
                  <span>
                    Chiết khấu khuyến mãi {selectedOrder.voucherCode && `(${selectedOrder.voucherCode})`}:
                  </span>
                  <span className="font-semibold">
                    -{formatCurrency(selectedOrder.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600">
                <span>Vận chuyển:</span>
                <span className="font-semibold text-emerald-700">
                  {selectedOrder.shippingFee > 0 ? formatCurrency(selectedOrder.shippingFee) : "Miễn phí toàn quốc"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Thuế giá trị gia tăng (VAT):</span>
                <span>Đã bao gồm trong giá sản phẩm</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Thành tiền thực thu:</span>
                <span className="text-base text-blue-600">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSelectedOrder(null)}
                className="h-9 px-5 rounded-lg text-xs font-semibold border-slate-200"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

