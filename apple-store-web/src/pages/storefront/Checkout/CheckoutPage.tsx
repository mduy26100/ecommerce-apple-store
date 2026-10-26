import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Radio,
  Button,
  Tag,
  Divider,
  message,
  Empty,
  Spin,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@features/auth";
import { useCart } from "@features/storefront/cart/hooks/useCart";
import { getOrCreateGuestId } from "@features/storefront/cart/utils/guest";
import { queryClient } from "@core/api/queryClient";
import { CART_QUERY_KEYS } from "@features/storefront/cart/constants/cart.constants";
import {
  orderApi,
  VoucherPickerModal,
  type UserVoucher,
  type PublicVoucher,
  type VoucherValidationResult,
  type CreateOrderPayload,
} from "@features/storefront/orders";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const user = useAuthStore((state) => state.user);
  const { data: cart, isLoading: isCartLoading } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherValidationResult | null>(null);

  const [publicVouchers, setPublicVouchers] = useState<PublicVoucher[]>([]);
  const [isPublicVouchersLoading, setIsPublicVouchersLoading] = useState(false);

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletVouchers, setWalletVouchers] = useState<UserVoucher[]>([]);
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  const selectedItems = useMemo(() => {
    return (cart?.items || []).filter((i) => i.isSelected && i.isAvailable && i.quantityInStock > 0);
  }, [cart?.items]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  }, [selectedItems]);

  const discountAmount = appliedVoucher?.discountAmount || 0;
  const shippingFee = 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  useEffect(() => {
    if (user) {
      const defaultName =
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        "";
      form.setFieldsValue({
        recipientName: defaultName,
        recipientPhone: user.phoneNumber || "0912345678",
        recipientEmail: user.email || "",
        shippingProvince: "Hà Nội",
        shippingDistrict: "Cầu Giấy",
        shippingWard: "Dịch Vọng Hậu",
        shippingAddressLine: "Tòa nhà Keangnam, Phạm Hùng",
        paymentMethod: "COD",
      });
    } else {
      form.setFieldsValue({
        shippingProvince: "TP. Hồ Chí Minh",
        shippingDistrict: "Quận 1",
        shippingWard: "Bến Nghé",
        paymentMethod: "COD",
      });
    }
  }, [user, form]);

  useEffect(() => {
    const fetchPublicVouchers = async () => {
      try {
        setIsPublicVouchersLoading(true);
        const data = await orderApi.getPublicVouchers();
        setPublicVouchers(data || []);
      } catch {
        setPublicVouchers([]);
      } finally {
        setIsPublicVouchersLoading(false);
      }
    };
    fetchPublicVouchers();
  }, []);

  const fetchWallet = async () => {
    try {
      setIsWalletLoading(true);
      const res = await orderApi.getMyWallet();
      setWalletVouchers(res || []);
    } catch {
      message.error("Không thể tải danh sách voucher ưu đãi.");
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleOpenWallet = () => {
    setWalletModalOpen(true);
    fetchWallet();
  };

  const applyVoucherCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) {
      message.warning("Vui lòng nhập mã ưu đãi.");
      return;
    }

    try {
      setIsValidatingVoucher(true);
      const guestId = !user ? getOrCreateGuestId() : undefined;
      const email = form.getFieldValue("recipientEmail");
      const phone = form.getFieldValue("recipientPhone");

      const res = await orderApi.validateVoucher({
        voucherCode: codeToApply.trim(),
        subtotal,
        guestId,
        email,
        phone,
      });

      if (res.isValid) {
        setAppliedVoucher(res);
        setVoucherInput(res.voucherCode || codeToApply.toUpperCase());
        message.success(res.message || "Áp dụng mã giảm giá thành công!");
      } else {
        setAppliedVoucher(null);
        message.error(res.message || "Mã ưu đãi không hợp lệ.");
      }
    } catch (err: any) {
      const errMsg = err?.message || "Không thể kiểm tra mã giảm giá vào lúc này.";
      message.error(errMsg);
      setAppliedVoucher(null);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
    message.info("Đã hủy áp dụng mã giảm giá.");
  };

  const handleSubmitOrder = async (values: any) => {
    if (selectedItems.length === 0) {
      message.warning("Không có sản phẩm nào khả dụng để thanh toán!");
      return;
    }

    try {
      setIsSubmitting(true);
      const guestId = !user ? getOrCreateGuestId() : null;

      const payload: CreateOrderPayload = {
        userId: user ? Number(user.id) : null,
        guestId,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        recipientEmail: values.recipientEmail,
        shippingAddressLine: values.shippingAddressLine,
        shippingWard: values.shippingWard,
        shippingDistrict: values.shippingDistrict,
        shippingProvince: values.shippingProvince,
        customerNote: values.customerNote,
        paymentMethod: values.paymentMethod || "COD",
        shippingFee,
        voucherCode: appliedVoucher?.voucherCode || null,
        items: selectedItems.map((item) => ({
          productVariantId: item.productVariantId,
          productName: item.productName,
          sku: item.sku,
          variantName: item.variantName,
          thumbnailUrl: item.imageUrl,
          selectedAttributesJson: item.attributes && item.attributes.length > 0 ? JSON.stringify(item.attributes) : null,
          colorName: item.attributes?.find((a) => a.optionName.toLowerCase().includes("màu") || a.optionName.toLowerCase().includes("color"))?.value || null,
          storageName: item.attributes?.find((a) => a.optionName.toLowerCase().includes("dung lượng") || a.optionName.toLowerCase().includes("storage") || a.optionName.toLowerCase().includes("ổ cứng"))?.value || null,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      };

      const result = await orderApi.createOrder(payload);

      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });

      navigate("/checkout/success", {
        replace: true,
        state: {
          orderNumber: result.orderNumber,
          totalAmount: result.totalAmount,
          recipientEmail: result.recipientEmail,
          recipientName: result.recipientName,
          recipientPhone: result.recipientPhone,
          paymentMethod: result.paymentMethod,
        },
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin!";
      message.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  if (isCartLoading) {
    return (
      <div className="min-h-120 flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-sm text-slate-500 font-medium">Đang khởi tạo trang thanh toán...</span>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Bạn chưa chọn sản phẩm nào trong giỏ hàng để tiến hành thanh toán."
          className="mb-6"
        />
        <Link to="/cart">
          <Button type="primary" size="large" icon={<ArrowLeftOutlined />} className="bg-blue-600 hover:bg-blue-500! rounded-xl font-medium">
            Quay lại giỏ hàng
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors mb-3"
        >
          <ArrowLeftOutlined /> Quay lại giỏ hàng
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Xác nhận & Thanh toán đơn hàng
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kiểm tra kỹ thông tin sản phẩm và địa chỉ nhận hàng trước khi đặt mua.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitOrder}
        requiredMark="optional"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircleOutlined className="text-blue-600" />
                  <span>1. Sản phẩm thanh toán ({selectedItems.length})</span>
                </h2>
                <Link to="/cart" className="text-xs text-blue-600 font-semibold hover:underline">
                  Chỉnh sửa giỏ
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-slate-300 text-xs">Apple</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">
                        {item.productName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.variantName || item.attributes?.map((a) => a.value).join(" - ")}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Số lượng: <span className="font-semibold text-slate-700">{item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 text-sm">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatCurrency(item.unitPrice)}/máy
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Divider className="my-6" />

              <div className="pb-3 border-b border-slate-100 mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <CarOutlined className="text-blue-600" />
                    <span>2. Thông tin giao nhận hàng</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {user
                      ? "Đã điền tự động theo thông tin tài khoản của bạn."
                      : "Khách vãng lai vui lòng điền email chính xác để nhận mã tra cứu và hóa đơn."}
                  </p>
                </div>
                {user && (
                  <Tag color="blue" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    Đã đăng nhập
                  </Tag>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Form.Item
                  name="recipientName"
                  label={<span className="font-medium text-slate-700 text-xs">Họ và tên người nhận</span>}
                  rules={[{ required: true, message: "Vui lòng nhập họ và tên người nhận!" }]}
                >
                  <Input placeholder="Ví dụ: Nguyễn Văn A" size="large" className="rounded-xl" />
                </Form.Item>

                <Form.Item
                  name="recipientPhone"
                  label={<span className="font-medium text-slate-700 text-xs">Số điện thoại liên hệ</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    { pattern: /^(0|\+84)[0-9]{9,10}$/, message: "Số điện thoại không hợp lệ!" },
                  ]}
                >
                  <Input placeholder="Ví dụ: 0912345678" size="large" className="rounded-xl" />
                </Form.Item>
              </div>

              <Form.Item
                name="recipientEmail"
                label={
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-700 text-xs">Email nhận hóa đơn & tra cứu</span>
                    <span className="text-[11px] text-red-500 font-bold">*Bắt buộc</span>
                  </div>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ email!" },
                  { type: "email", message: "Địa chỉ email không đúng định dạng!" },
                ]}
                extra={
                  <span className="text-[11px] text-slate-400">
                    Hệ thống sẽ gửi hóa đơn điện tử, mã vận đơn và đường dẫn theo dõi tiến trình trực tiếp qua email này.
                  </span>
                }
              >
                <Input placeholder="example@gmail.com" size="large" className="rounded-xl" />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                <Form.Item
                  name="shippingProvince"
                  label={<span className="font-medium text-slate-700 text-xs">Tỉnh / Thành phố</span>}
                  rules={[{ required: true, message: "Vui lòng nhập Tỉnh/Thành phố!" }]}
                >
                  <Input placeholder="Hà Nội, TP.HCM..." size="large" className="rounded-xl" />
                </Form.Item>

                <Form.Item
                  name="shippingDistrict"
                  label={<span className="font-medium text-slate-700 text-xs">Quận / Huyện</span>}
                >
                  <Input placeholder="Quận / Huyện" size="large" className="rounded-xl" />
                </Form.Item>

                <Form.Item
                  name="shippingWard"
                  label={<span className="font-medium text-slate-700 text-xs">Phường / Xã</span>}
                >
                  <Input placeholder="Phường / Xã" size="large" className="rounded-xl" />
                </Form.Item>
              </div>

              <Form.Item
                name="shippingAddressLine"
                label={<span className="font-medium text-slate-700 text-xs">Địa chỉ nhận hàng cụ thể</span>}
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)!" }]}
              >
                <Input placeholder="Số nhà, tên ngõ, tòa nhà hoặc đường..." size="large" className="rounded-xl" />
              </Form.Item>

              <Form.Item
                name="customerNote"
                label={<span className="font-medium text-slate-700 text-xs">Ghi chú giao hàng (Tùy chọn)</span>}
              >
                <Input.TextArea
                  placeholder="Giao hàng giờ hành chính, gọi trước khi đến..."
                  rows={2}
                  className="rounded-xl"
                />
              </Form.Item>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <GiftOutlined className="text-blue-600" />
                  <span>Mã giảm giá & Khuyến mãi</span>
                </h2>
                <Button
                  type="link"
                  size="small"
                  className="p-0 text-blue-600 font-semibold text-xs"
                  onClick={handleOpenWallet}
                >
                  Mở ví voucher
                </Button>
              </div>

              {appliedVoucher ? (
                <div className="p-3 bg-emerald-50/80 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {appliedVoucher.voucherCode}
                      </span>
                      <Tag color="success" className="rounded-full text-[10px]">Đã áp dụng</Tag>
                      {appliedVoucher.remainingUses !== undefined && appliedVoucher.remainingUses !== null && (
                        <Tag color="purple" className="rounded-full text-[10px] font-semibold">
                          Còn {appliedVoucher.remainingUses} lượt dùng
                        </Tag>
                      )}
                    </div>
                    <div className="text-xs text-emerald-600 mt-0.5 font-medium">
                      Giảm: -{formatCurrency(appliedVoucher.discountAmount)}
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={handleRemoveVoucher}
                    className="text-slate-400 hover:text-red-500 rounded-lg text-xs"
                  >
                    Gỡ bỏ
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nhập mã ưu đãi (VD: APPLE2026)"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      size="large"
                      className="rounded-xl uppercase font-semibold"
                      onPressEnter={() => applyVoucherCode(voucherInput)}
                    />
                    <Button
                      type="primary"
                      size="large"
                      loading={isValidatingVoucher}
                      onClick={() => applyVoucherCode(voucherInput)}
                      className="bg-blue-600 hover:bg-blue-500! rounded-xl font-medium shrink-0"
                    >
                      Áp dụng
                    </Button>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Mã ưu đãi công khai có sẵn:
                    </div>
                    {isPublicVouchersLoading ? (
                      <div className="py-2 text-center">
                        <Spin size="small" />
                      </div>
                    ) : publicVouchers.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {publicVouchers.map((pv) => {
                          const discountDesc =
                            pv.discountType === "Percentage"
                              ? `giảm ${pv.discountValue}%${pv.maxDiscountAmount ? ` (tối đa ${formatCurrency(pv.maxDiscountAmount)})` : ""}`
                              : `giảm ${formatCurrency(pv.discountValue)}`;
                          const minOrderDesc = pv.minOrderAmount ? ` cho đơn từ ${formatCurrency(pv.minOrderAmount)}` : "";

                          return (
                            <div
                              key={pv.id}
                              onClick={() => {
                                setVoucherInput(pv.code);
                                applyVoucherCode(pv.code);
                              }}
                              className="py-2.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                  <span className="font-extrabold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded">
                                    {pv.code}
                                  </span>
                                  <Tag color="purple" className="rounded-full text-[10px] font-semibold m-0">
                                    Còn {pv.remainingUses.toLocaleString("vi-VN")} lượt dùng
                                  </Tag>
                                </div>
                                <div className="text-xs text-slate-600 leading-snug">
                                  Nhập mã <span className="font-bold text-slate-800">{pv.code}</span> để được {discountDesc}{minOrderDesc}
                                </div>
                              </div>
                              <Button
                                type="link"
                                size="small"
                                className="p-0 text-blue-600 font-semibold text-xs group-hover:underline shrink-0"
                              >
                                Dùng ngay
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">
                        Hiện chưa có mã công khai nào đang hoạt động.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Divider className="my-5" />

              <div className="pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
                <CreditCardOutlined className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-800">Chi tiết & Phương thức thanh toán</h2>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính hàng ({selectedItems.length} món)</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    Phí vận chuyển
                    <Tag color="cyan" className="rounded-full text-[10px]">Miễn phí</Tag>
                  </span>
                  <span className="font-semibold text-slate-800">0 đ</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Ưu đãi voucher</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              <Divider className="my-3" />

              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <span className="text-base font-extrabold text-slate-900 block">Tổng thanh toán</span>
                  <span className="text-[11px] text-slate-400">Đã bao gồm thuế GTGT nếu có</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600 tracking-tight">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <Divider className="my-4" />

              <div>
                <div className="text-xs font-bold text-slate-700 mb-2.5">
                  Phương thức thanh toán:
                </div>
                <Form.Item name="paymentMethod" className="mb-0">
                  <Radio.Group className="w-full space-y-2">
                    <div
                      onClick={() => form.setFieldsValue({ paymentMethod: "COD" })}
                      className="p-2.5 rounded-xl bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors flex items-start gap-2.5"
                    >
                      <Radio value="COD" className="mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">
                          Thanh toán khi nhận hàng (COD)
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Thanh toán tiền mặt cho bưu tá khi nhận và kiểm tra hàng.
                        </div>
                      </div>
                    </div>

                    <Tooltip title="Cổng thanh toán trực tuyến qua thẻ và ví điện tử đang trong giai đoạn kết nối thử nghiệm.">
                      <div className="p-2.5 rounded-xl bg-slate-50 opacity-60 cursor-not-allowed flex items-start gap-2.5">
                        <Radio value="ONLINE" disabled className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 text-xs sm:text-sm">Thanh toán trực tuyến (VNPAY / Thẻ / Ví)</span>
                            <Tag color="orange" className="rounded-full text-[10px] font-bold">Đang phát triển</Tag>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            Tích hợp QR Code và bảo mật ngân hàng sẽ khả dụng sớm.
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  </Radio.Group>
                </Form.Item>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isSubmitting}
                className="w-full h-12 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95! rounded-xl font-bold text-base shadow-md cursor-pointer transition-all mt-4"
              >
                Hoàn tất đặt hàng
              </Button>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                <SafetyCertificateOutlined className="text-emerald-500 text-sm" />
                <span>Bảo mật đơn hàng & Cam kết chính hãng 100% Apple VN</span>
              </div>
            </div>
          </div>
        </div>
      </Form>

      <VoucherPickerModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        vouchers={walletVouchers}
        isLoading={isWalletLoading}
        selectedCode={appliedVoucher?.voucherCode}
        onSelect={(code) => applyVoucherCode(code)}
        subtotal={subtotal}
      />
    </div>
  );
};

export default CheckoutPage;
