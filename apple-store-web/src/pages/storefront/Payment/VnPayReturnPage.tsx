import React, { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button, Tag, Divider } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ShoppingOutlined,
  HomeOutlined,
  RedoOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@features/auth";

export const VnPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const responseCode = searchParams.get("vnp_ResponseCode") || "";
  const orderNumber = searchParams.get("vnp_TxnRef") || searchParams.get("orderNumber") || "";
  const rawAmount = searchParams.get("vnp_Amount") || searchParams.get("amount") || "0";
  const transactionNo = searchParams.get("vnp_TransactionNo") || "";
  const bankCode = searchParams.get("vnp_BankCode") || "";
  const payDateRaw = searchParams.get("vnp_PayDate") || "";
  const successParam = searchParams.get("success");

  const isSuccess = useMemo(() => {
    if (successParam === "true") return true;
    if (successParam === "false") return false;
    return responseCode === "00";
  }, [responseCode, successParam]);

  const amount = useMemo(() => {
    const val = Number(rawAmount);
    if (isNaN(val) || val <= 0) return 0;
    if (val > 100000000 && !searchParams.get("amount")) {
      return val / 100;
    }
    return val > 100000 ? (rawAmount.length >= 8 && rawAmount.endsWith("00") ? val / 100 : val) : val;
  }, [rawAmount, searchParams]);

  const formattedDate = useMemo(() => {
    if (!payDateRaw || payDateRaw.length !== 14) {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());
    }

    const year = payDateRaw.substring(0, 4);
    const month = payDateRaw.substring(4, 6);
    const day = payDateRaw.substring(6, 8);
    const hour = payDateRaw.substring(8, 10);
    const minute = payDateRaw.substring(10, 12);
    const second = payDateRaw.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  }, [payDateRaw]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "24":
        return "Giao dịch đã bị hủy bởi khách hàng.";
      case "51":
        return "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
      case "11":
        return "Đã hết thời gian chờ thanh toán. Vui lòng thử lại.";
      case "75":
        return "Ngân hàng thanh toán đang bảo trì.";
      default:
        return "Giao dịch thanh toán trực tuyến không thành công.";
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-10 text-center">
        <div className="flex justify-center mb-5">
          {isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center animate-bounce-short">
              <CheckCircleFilled className="text-emerald-500 text-5xl" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center">
              <CloseCircleFilled className="text-rose-500 text-5xl" />
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {isSuccess ? "Thanh toán thành công qua VNPAY" : "Thanh toán không thành công"}
        </h1>

        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
          {isSuccess
            ? "Cảm ơn quý khách đã tin tưởng mua sắm tại Apple Store. Đơn hàng của bạn đã được thanh toán hoàn tất và đang được chuẩn bị để đóng gói vận chuyển."
            : getErrorMessage(responseCode)}
        </p>

        <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-5 sm:p-6 text-left max-w-lg mx-auto mb-8">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chi tiết giao dịch
            </span>
            <Tag color={isSuccess ? "success" : "error"} className="rounded-full px-2.5 py-0.5 text-xs font-bold m-0">
              {isSuccess ? "Giao dịch thành công" : "Thất bại"}
            </Tag>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            {orderNumber && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{orderNumber}</span>
              </div>
            )}

            {amount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tiền thanh toán:</span>
                <span className="font-black text-blue-600 text-base">{formatCurrency(amount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cổng thanh toán:</span>
              <span className="font-semibold text-slate-800">Cổng điện tử VNPAY</span>
            </div>

            {bankCode && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-semibold text-slate-800 uppercase">{bankCode}</span>
              </div>
            )}

            {transactionNo && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mã GD VNPAY:</span>
                <span className="font-mono text-slate-700">{transactionNo}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thời gian:</span>
              <span className="text-slate-700 font-medium">{formattedDate}</span>
            </div>
          </div>
        </div>

        {!isSuccess && user && (
          <div className="mb-6 p-3.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 text-left max-w-lg mx-auto">
            <span className="font-bold block mb-0.5">Lưu ý về đơn hàng chờ thanh toán:</span>
            Đơn hàng của bạn vẫn được lưu tạm thời. Bạn có thể truy cập mục "Đơn hàng của tôi" để thực hiện thanh toán lại trong vòng 15 phút trước khi đơn tự động hủy.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          {user ? (
            <Link to="/orders" className="w-full sm:w-auto flex-1">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                className="w-full bg-blue-600 hover:bg-blue-500! rounded-xl font-semibold h-11 text-xs sm:text-sm"
              >
                Xem đơn hàng của tôi
              </Button>
            </Link>
          ) : (
            <Link to="/order-lookup" className="w-full sm:w-auto flex-1">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                className="w-full bg-blue-600 hover:bg-blue-500! rounded-xl font-semibold h-11 text-xs sm:text-sm"
              >
                Tra cứu đơn hàng
              </Button>
            </Link>
          )}

          {!isSuccess && user && (
            <Link to="/orders" className="w-full sm:w-auto">
              <Button
                type="default"
                size="large"
                icon={<RedoOutlined />}
                className="w-full rounded-xl font-semibold h-11 text-xs sm:text-sm border-blue-200 text-blue-600 hover:border-blue-500"
              >
                Thanh toán lại
              </Button>
            </Link>
          )}

          <Link to="/" className="w-full sm:w-auto">
            <Button
              type="default"
              size="large"
              icon={<HomeOutlined />}
              className="w-full rounded-xl font-semibold h-11 text-xs sm:text-sm border-slate-200"
            >
              Trang chủ
            </Button>
          </Link>
        </div>

        <Divider className="my-8" />

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <SafetyCertificateOutlined className="text-emerald-500 text-sm" />
          <span>Giao dịch được bảo mật bởi chuẩn thanh toán VNPAY & hệ thống Apple Store</span>
        </div>
      </div>
    </div>
  );
};

export default VnPayReturnPage;
