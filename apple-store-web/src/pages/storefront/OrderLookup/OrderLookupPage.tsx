import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Steps,
  Tag,
  Spin,
  Timeline,
  message,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  LaptopOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  SmileOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { AppleLogo } from "@shared/components/icons/AppleLogo";
import { useAuthStore } from "@features/auth";
import { getGuestId } from "@features/storefront/cart/utils/guest";
import {
  orderApi,
  OrderStatusBadge,
  type OrderDetail,
  type OrderSummary,
} from "@features/storefront/orders";

const OrderLookupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [itemImageErrors, setItemImageErrors] = useState<Record<number, boolean>>({});

  const guestId = getGuestId();

  useEffect(() => {
    if (user) {
      navigate("/orders", { replace: true });
    }
  }, [user, navigate]);

  const fetchRecentOrders = async () => {
    if (!guestId) return;
    try {
      const res = await orderApi.getGuestRecentOrders(guestId);
      setRecentOrders(res || []);
    } catch {
      setRecentOrders([]);
    }
  };

  const handleLookup = async (values: { orderNumber: string; phoneOrEmail: string }) => {
    try {
      setIsLoading(true);
      setOrderDetail(null);
      setItemImageErrors({});
      const res = await orderApi.lookupOrder({
        orderNumber: values.orderNumber.trim(),
        phoneOrEmail: values.phoneOrEmail.trim(),
      });
      setOrderDetail(res);
      message.success("Tìm thấy thông tin đơn hàng!");
    } catch (err: any) {
      const errMsg = err?.message || "Không tìm thấy đơn hàng hoặc thông tin xác thực chưa chính xác!";
      message.error(errMsg);
      setOrderDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();

    const paramOrderNumber = searchParams.get("orderNumber");
    const paramTerm = searchParams.get("term");
    if (paramOrderNumber && paramTerm) {
      form.setFieldsValue({
        orderNumber: paramOrderNumber,
        phoneOrEmail: paramTerm,
      });
      handleLookup({ orderNumber: paramOrderNumber, phoneOrEmail: paramTerm });
    }
  }, [searchParams]);

  const handleSelectRecentOrder = (order: OrderSummary) => {
    const term = order.recipientEmail || order.recipientPhone || "";
    form.setFieldsValue({
      orderNumber: order.orderNumber,
      phoneOrEmail: term,
    });
    handleLookup({ orderNumber: order.orderNumber, phoneOrEmail: term });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const getStepCurrent = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return 0;
    if (s === "confirmed") return 1;
    if (s === "processing" || s === "shipping") return 2;
    if (s === "delivered") return 3;
    if (s === "completed") return 4;
    return 0;
  };

  if (user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tra cứu tiến trình đơn hàng
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Nhập mã đơn hàng và số điện thoại hoặc email đã sử dụng khi đặt hàng để theo dõi lịch trình vận chuyển chính xác nhất.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLookup}
          requiredMark={false}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="orderNumber"
              label={<span className="font-semibold text-slate-700 text-xs">Mã đơn hàng</span>}
              rules={[{ required: true, message: "Vui lòng nhập mã đơn hàng!" }]}
            >
              <Input
                id="orderNumber"
                placeholder="VD: ORD-20261026-XXXXXX"
                size="large"
                className="rounded-xl uppercase font-semibold"
              />
            </Form.Item>

            <Form.Item
              name="phoneOrEmail"
              label={<span className="font-semibold text-slate-700 text-xs">Số điện thoại hoặc Email người nhận</span>}
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại hoặc email!" }]}
            >
              <Input
                id="phoneOrEmail"
                placeholder="VD: 0912345678 hoặc email@domain.com"
                size="large"
                className="rounded-xl"
              />
            </Form.Item>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
            icon={<SearchOutlined />}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500! rounded-xl font-bold text-sm shadow-md"
          >
            Tra cứu đơn hàng
          </Button>
        </Form>
      </div>

      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-sm text-slate-500">Đang tìm kiếm thông tin đơn hàng từ hệ thống...</span>
        </div>
      )}

      {orderDetail && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-blue-600 tracking-wide bg-blue-50 px-3 py-1 rounded-xl">
                  {orderDetail.orderNumber}
                </span>
                <OrderStatusBadge status={orderDetail.status} />
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <CalendarOutlined />
                <span>Đặt hàng lúc: {new Date(orderDetail.placedAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Tổng thanh toán:</span>
              <span className="text-xl font-black text-slate-900">{formatCurrency(orderDetail.totalAmount)}</span>
            </div>
          </div>

          {orderDetail.status.toLowerCase() !== "cancelled" ? (
            <div className="py-4 px-2">
              <Steps
                current={getStepCurrent(orderDetail.status)}
                className="ant-steps-horizontal"
                items={[
                  { title: "Chờ xử lý", icon: <ClockCircleOutlined /> },
                  { title: "Đã xác nhận", icon: <CheckCircleFilled /> },
                  { title: "Đang giao hàng", icon: <CarOutlined /> },
                  { title: "Đã giao hàng", icon: <SmileOutlined /> },
                  { title: "Đã nhận hàng", icon: <CheckCircleOutlined /> },
                ]}
              />
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-600 font-semibold">
              Đơn hàng này hiện đã ở trạng thái ĐÃ HỦY.
            </div>
          )}

          {(orderDetail.status.toLowerCase() === "delivered" || orderDetail.status.toLowerCase() === "completed") && (
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 leading-relaxed">
              <span className="font-bold text-amber-800 block mb-1">
                Lưu ý nhận hàng & Chính sách đổi trả:
              </span>
              Quý khách vui lòng quay video rõ nét khi mở kiện hàng. Nếu phát sinh lỗi hoặc có nhu cầu Đổi trả / Hoàn tiền trong vòng <strong className="text-amber-950 font-bold">15 ngày</strong> kể từ khi nhận hàng, vui lòng liên hệ ngay bộ phận CSKH qua Hotline <strong>1900 8888</strong> hoặc Email <strong>cskh@applestore.vn</strong> để được tiếp nhận hỗ trợ nhanh nhất.
            </div>
          )}

          {orderDetail.statusHistory && orderDetail.statusHistory.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3">
                Lịch sử tiến trình đơn hàng
              </h3>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <Timeline
                  className="mt-1"
                  items={orderDetail.statusHistory.map((h) => ({
                    children: (
                      <div className="text-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span>{h.statusName || h.status}</span>
                          <span className="text-slate-400 font-normal">
                            ({h.actor === "Customer" ? "Khách hàng" : h.actor === "Manager" ? "Quản trị viên" : h.actor})
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {new Date(h.changedAt).toLocaleString("vi-VN")}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50/80 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <UserOutlined className="text-blue-600" />
                <span>Thông tin người nhận</span>
              </div>
              <div>Họ và tên: <span className="font-semibold text-slate-800">{orderDetail.recipientName}</span></div>
              <div>Số điện thoại: <span className="font-semibold text-slate-800">{orderDetail.recipientPhone}</span></div>
              {orderDetail.recipientEmail && (
                <div>Email: <span className="font-semibold text-slate-800">{orderDetail.recipientEmail}</span></div>
              )}
              <div className="pt-1 flex items-start gap-1.5">
                <EnvironmentOutlined className="text-slate-400 mt-0.5" />
                <span>
                  {orderDetail.shippingAddressLine}
                  {orderDetail.shippingWard ? `, ${orderDetail.shippingWard}` : ""}
                  {orderDetail.shippingDistrict ? `, ${orderDetail.shippingDistrict}` : ""}
                  {`, ${orderDetail.shippingProvince}`}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 text-sm mb-2">
                Thông tin thanh toán & vận chuyển
              </div>
              <div>
                Phương thức: <span className="font-semibold text-slate-800">
                  {orderDetail.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : orderDetail.paymentMethod}
                </span>
              </div>
              <div>Tình trạng thanh toán: <span className="font-semibold text-slate-800">{orderDetail.paymentStatus}</span></div>
              <div>Vận chuyển: <span className="font-semibold text-emerald-600">Miễn phí giao hàng</span></div>
              {orderDetail.voucherCode && (
                <div>
                  Mã giảm giá: <Tag color="success" className="text-[10px] rounded font-semibold">{orderDetail.voucherCode}</Tag>
                  <span>(-{formatCurrency(orderDetail.discountAmount)})</span>
                </div>
              )}
              {orderDetail.customerNote && (
                <div className="pt-1 text-slate-500 italic">
                  Ghi chú: "{orderDetail.customerNote}"
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3">
              Chi tiết mặt hàng ({orderDetail.items?.length || 0})
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4">
              {orderDetail.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {item.thumbnailUrl && !itemImageErrors[item.id] ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                        onError={() => setItemImageErrors((prev) => ({ ...prev, [item.id]: true }))}
                      />
                    ) : (
                      <AppleLogo size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-semibold text-slate-800 truncate text-sm">{item.productName}</div>
                    <div className="text-slate-500 mt-0.5">
                      {item.variantName || `${item.colorName || ""} ${item.storageName || ""}`.trim()}
                    </div>
                    <div className="text-slate-400 mt-1">
                      Số lượng: <span className="font-semibold text-slate-700">{item.quantity}</span> x {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm shrink-0">
                    {formatCurrency(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-start sm:items-center gap-2">
              <CustomerServiceOutlined className="text-blue-600 text-base mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-slate-800 block sm:inline mr-1">Cần hỗ trợ về đơn hàng này?</span>
                Nếu quý khách muốn thay đổi thông tin nhận hàng hoặc hủy đơn, vui lòng liên hệ CSKH.
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <a href="tel:19008888" className="font-bold text-blue-600 hover:underline">
                Hotline: 1900 8888
              </a>
              <span className="text-slate-300">|</span>
              <a href="mailto:cskh@applestore.vn" className="font-bold text-blue-600 hover:underline">
                cskh@applestore.vn
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400 italic">
              Tra cứu thông tin công khai (chế độ chỉ đọc)
            </div>

            <div className="text-right ml-auto text-xs space-y-1">
              <div className="text-slate-500">
                Tạm tính: <span className="font-semibold text-slate-800">{formatCurrency(orderDetail.subtotal)}</span>
              </div>
              {orderDetail.discountAmount > 0 && (
                <div className="text-emerald-600 font-medium">
                  Ưu đãi: -{formatCurrency(orderDetail.discountAmount)}
                </div>
              )}
              <div className="text-sm font-bold text-slate-900 pt-1">
                Tổng thanh toán: <span className="text-blue-600 text-base">{formatCurrency(orderDetail.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {recentOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <LaptopOutlined className="text-blue-600 text-lg" />
            <h2 className="text-base font-bold text-slate-800">
              Đơn hàng gần đây trên thiết bị này ({recentOrders.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Các đơn hàng tự do vừa được đặt trên trình duyệt này. Nhấn vào đơn bất kỳ để xem tiến trình giao hàng ngay lập tức.
          </p>

          <div className="space-y-3">
            {recentOrders.map((ro) => (
              <div
                key={ro.id}
                onClick={() => handleSelectRecentOrder(ro)}
                className="border border-slate-200/80 hover:border-blue-400 rounded-2xl p-4 transition-all bg-white hover:bg-blue-50/20 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-blue-600 text-sm tracking-wide bg-blue-50 px-2.5 py-0.5 rounded-lg">
                      {ro.orderNumber}
                    </span>
                    <OrderStatusBadge status={ro.status} />
                  </div>
                  <div className="text-xs text-slate-500">
                    Người nhận: <span className="font-semibold text-slate-700">{ro.recipientName}</span> ({ro.recipientEmail || ro.recipientPhone})
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                  <span className="font-black text-slate-900 text-sm">{formatCurrency(ro.totalAmount)}</span>
                  <span className="text-[11px] text-blue-600 font-semibold hover:underline">
                    Xem tiến trình &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderLookupPage;
