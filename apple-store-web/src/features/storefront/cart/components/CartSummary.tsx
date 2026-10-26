import { Button } from "antd";
import {
  SafetyCertificateOutlined,
  SyncOutlined,
  CarOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import type { Cart } from "../types/cart.types";

export interface CartSummaryProps {
  cart: Cart;
  onCheckout: () => void;
  isLoading?: boolean;
}

const formatVND = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const CartSummary = ({
  cart,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) => {
  const isCheckoutDisabled = cart.selectedItemsCount === 0 || isLoading;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs sticky top-24 space-y-5">
      <h2 className="text-lg font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Sản phẩm đã chọn:</span>
          <strong className="text-slate-900 font-bold">{cart.selectedItemsCount} món</strong>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Tạm tính tiền hàng:</span>
          <span className="text-slate-900 font-semibold">{formatVND(cart.subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Phí vận chuyển:</span>
          <span className="text-emerald-600 font-semibold">Miễn phí toàn quốc</span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="block text-base font-black text-slate-900">Tổng thanh toán</span>
            <span className="block text-[11px] text-slate-400">Đã bao gồm thuế VAT</span>
          </div>
          <span
            data-testid="cart-total-amount"
            className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight"
          >
            {formatVND(cart.subtotal)}
          </span>
        </div>
      </div>

      <Button
        type="primary"
        size="large"
        disabled={isCheckoutDisabled}
        onClick={onCheckout}
        data-testid="cart-checkout-button"
        className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-sm shadow-md shadow-blue-500/20 border-none flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Tiến hành đặt hàng</span>
        <ArrowRightOutlined />
      </Button>

      <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <SafetyCertificateOutlined className="text-blue-600 text-sm shrink-0" />
          <span>Cam kết 100% chính hãng Apple VN/A</span>
        </div>
        <div className="flex items-center gap-2">
          <SyncOutlined className="text-blue-600 text-sm shrink-0" />
          <span>Đổi trả mới trong 30 ngày nếu phát sinh lỗi</span>
        </div>
        <div className="flex items-center gap-2">
          <CarOutlined className="text-blue-600 text-sm shrink-0" />
          <span>Giao hỏa tốc miễn phí nội thành 2 giờ</span>
        </div>
      </div>
    </div>
  );
};
