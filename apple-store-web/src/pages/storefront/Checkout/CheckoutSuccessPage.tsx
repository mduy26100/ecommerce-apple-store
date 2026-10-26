import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, message } from "antd";
import {
  CopyOutlined,
  ShoppingOutlined,
  SearchOutlined,
  MailOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useAuthStore } from "@features/auth";

const CheckoutSuccessPage: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const state = location.state || {};

  const orderNumber = state.orderNumber || "ORD-20261026-APPLE";
  const recipientEmail = state.recipientEmail || "khachhang@gmail.com";
  const recipientName = state.recipientName || "Quý khách";
  const recipientPhone = state.recipientPhone || "";
  const totalAmount = state.totalAmount || 0;
  const paymentMethod = state.paymentMethod || "COD";

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    message.success("Đã sao chép mã đơn hàng vào bộ nhớ tạm!");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-4xl mb-4">
          <CheckCircleFilled />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Đặt hàng thành công!
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Cảm ơn bạn đã lựa chọn mua sắm thiết bị chính hãng tại Apple Store VN. Đơn hàng của bạn đang được hệ thống tiếp nhận.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 inline-flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
          <span className="text-xs font-semibold text-blue-900">Mã đơn hàng của bạn:</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-700 text-base tracking-wider bg-white px-3 py-1 rounded-lg border border-blue-200">
              {orderNumber}
            </span>
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={handleCopyOrderNumber}
              className="text-blue-600 hover:text-blue-800 rounded-lg"
              title="Sao chép mã đơn hàng"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left max-w-lg mx-auto mb-8 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
            <MailOutlined className="text-blue-600 text-sm" />
            <span>Thông báo xác nhận tự động</span>
          </div>
          <p>
            Hóa đơn chi tiết và liên kết tra cứu tiến trình đơn hàng bí mật đã được gửi tới email:{" "}
            <span className="font-bold text-slate-800">{recipientEmail}</span>.
          </p>
          <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">Người nhận:</span>
              <span className="font-semibold text-slate-700">{recipientName} {recipientPhone ? `(${recipientPhone})` : ""}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Thanh toán:</span>
              <span className="font-semibold text-slate-700">{paymentMethod === "COD" ? "Thu hộ COD khi nhận" : paymentMethod}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">Tổng thanh toán:</span>
              <span className="font-extrabold text-blue-600 text-sm">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/order-lookup?orderNumber=${encodeURIComponent(orderNumber)}&term=${encodeURIComponent(recipientEmail)}`}
            className="w-full sm:w-auto"
          >
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500! rounded-xl font-bold"
            >
              Tra cứu đơn hàng này
            </Button>
          </Link>

          {user && (
            <Link to="/orders" className="w-full sm:w-auto">
              <Button size="large" className="w-full sm:w-auto rounded-xl font-semibold border-slate-300">
                Xem lịch sử đơn của tôi
              </Button>
            </Link>
          )}

          <Link to="/products" className="w-full sm:w-auto">
            <Button
              size="large"
              icon={<ShoppingOutlined />}
              className="w-full sm:w-auto rounded-xl font-semibold border-slate-300 text-slate-700"
            >
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
