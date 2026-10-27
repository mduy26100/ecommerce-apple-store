import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Spin,
  Empty,
  Button,
  Tabs,
  Modal,
  Tag,
  Divider,
  Steps,
  Timeline,
  Radio,
  Input,
  Popconfirm,
  Pagination,
  Form,
  message,
} from "antd";
import {
  ShoppingOutlined,
  CalendarOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CarOutlined,
  SmileOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  EditOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { AppleLogo } from "@shared/components/icons/AppleLogo";
import { useAuthStore, AUTH_STATUS } from "@features/auth";
import { getGuestId } from "@features/storefront/cart/utils/guest";
import {
  orderApi,
  OrderStatusBadge,
  PaymentStatusBadge,
  GuestOrderMergeBanner,
  type OrderSummary,
  type OrderDetail,
} from "@features/storefront/orders";

const PRESET_CANCEL_REASONS = [
  "Tôi muốn thay đổi địa chỉ nhận hàng",
  "Tôi muốn đổi màu sắc / dung lượng sản phẩm",
  "Tôi đặt nhầm số lượng",
  "Tôi tìm thấy giá tốt hơn ở nơi khác",
  "Khác",
];

const PAGE_SIZE = 5;

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [unmergedCount, setUnmergedCount] = useState(0);
  const guestId = getGuestId();

  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{ id: number; orderNumber: string } | null>(null);
  const [selectedReason, setSelectedReason] = useState(PRESET_CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm] = Form.useForm();

  const fetchOrders = async (page: number, tabKey: string, searchKeyword: string) => {
    try {
      setIsLoading(true);
      const statusParam = tabKey === "ALL" ? undefined : tabKey;
      const res = await orderApi.getMyOrders({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        status: statusParam,
        search: searchKeyword || undefined,
      });

      const pagedInfo = (res as any)?.meta?.cursorPagedResult;
      if (pagedInfo && typeof pagedInfo.totalCount === "number") {
        setTotalCount(pagedInfo.totalCount);
      } else {
        setTotalCount(Array.isArray(res) ? res.length : 0);
      }

      setOrders(Array.isArray(res) ? res : []);
    } catch {
      message.error("Không thể tải danh sách đơn hàng của bạn.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkUnmergedGuestOrders = async () => {
    if (!guestId) return;
    try {
      const res = await orderApi.getUnmergedGuestCount(guestId);
      setUnmergedCount(res.count || 0);
    } catch {
      setUnmergedCount(0);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders(currentPage, activeTab, activeSearch);
      checkUnmergedGuestOrders();
    }
  }, [user, currentPage, activeTab, activeSearch]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm.trim());
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetail = async (orderId: number) => {
    try {
      setIsDetailLoading(true);
      setIsModalOpen(true);
      const res = await orderApi.getMyOrderDetail(orderId);
      setSelectedOrder(res);
    } catch {
      message.error("Không thể tải chi tiết đơn hàng.");
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const reloadCurrentOrderDetail = async () => {
    if (!selectedOrder) return;
    try {
      const res = await orderApi.getMyOrderDetail(selectedOrder.id);
      setSelectedOrder(res);
    } catch {
    }
  };

  const handleOpenCancelModal = (orderId: number, orderNumber: string) => {
    setOrderToCancel({ id: orderId, orderNumber });
    setSelectedReason(PRESET_CANCEL_REASONS[0]);
    setCustomReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    const finalReason = selectedReason === "Khác" ? customReason.trim() : selectedReason;
    if (selectedReason === "Khác" && !finalReason) {
      message.warning("Vui lòng nhập lý do hủy đơn.");
      return;
    }

    try {
      setIsCancelling(true);
      await orderApi.cancelOrder(orderToCancel.id, { reason: finalReason });
      message.success("Hủy đơn hàng thành công.");
      setCancelModalOpen(false);
      setOrderToCancel(null);
      await fetchOrders(currentPage, activeTab, activeSearch);
      if (selectedOrder && selectedOrder.id === orderToCancel.id) {
        await reloadCurrentOrderDetail();
      }
    } catch {
      message.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReceived = async (orderId: number) => {
    try {
      setIsConfirming(true);
      await orderApi.confirmReceived(orderId);
      message.success("Xác nhận đã nhận hàng thành công. Cảm ơn quý khách!");
      await fetchOrders(currentPage, activeTab, activeSearch);
      if (selectedOrder && selectedOrder.id === orderId) {
        await reloadCurrentOrderDetail();
      }
    } catch {
      message.error("Không thể xác nhận nhận hàng. Vui lòng thử lại sau.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenEditAddress = () => {
    if (!selectedOrder) return;
    addressForm.setFieldsValue({
      recipientName: selectedOrder.recipientName,
      recipientPhone: selectedOrder.recipientPhone,
      recipientEmail: selectedOrder.recipientEmail || "",
      shippingProvince: selectedOrder.shippingProvince,
      shippingDistrict: selectedOrder.shippingDistrict || "",
      shippingWard: selectedOrder.shippingWard || "",
      shippingAddressLine: selectedOrder.shippingAddressLine,
    });
    setIsEditAddressOpen(true);
  };

  const handleSaveEditAddress = async (values: any) => {
    if (!selectedOrder) return;
    try {
      setIsSavingAddress(true);
      await orderApi.updateShippingAddress(selectedOrder.id, {
        recipientName: values.recipientName.trim(),
        recipientPhone: values.recipientPhone.trim(),
        recipientEmail: values.recipientEmail ? values.recipientEmail.trim() : undefined,
        shippingProvince: values.shippingProvince.trim(),
        shippingDistrict: values.shippingDistrict ? values.shippingDistrict.trim() : undefined,
        shippingWard: values.shippingWard ? values.shippingWard.trim() : undefined,
        shippingAddressLine: values.shippingAddressLine.trim(),
      });
      message.success("Cập nhật thông tin giao nhận thành công.");
      setIsEditAddressOpen(false);
      await reloadCurrentOrderDetail();
      await fetchOrders(currentPage, activeTab, activeSearch);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Không thể cập nhật thông tin giao nhận.";
      message.error(errorMsg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const [repayingOrderId, setRepayingOrderId] = useState<number | null>(null);

  const handleRepay = async (orderId: number) => {
    try {
      setRepayingOrderId(orderId);
      const res = await orderApi.repayVnPay(orderId);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        message.error("Không thể khởi tạo đường dẫn thanh toán VNPAY.");
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Không thể thực hiện thanh toán lại.";
      message.error(errMsg);
    } finally {
      setRepayingOrderId(null);
    }
  };

  const getStepCurrent = (orderStatus: string) => {
    switch (orderStatus.toLowerCase()) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "processing":
      case "shipping":
        return 2;
      case "delivered":
        return 3;
      case "completed":
        return 4;
      default:
        return 0;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const tabItems = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "CONFIRMED", label: "Đã xác nhận" },
    { key: "SHIPPING", label: "Đang giao" },
    { key: "DELIVERED", label: "Đã giao" },
    { key: "COMPLETED", label: "Đã nhận hàng" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  if (status === AUTH_STATUS.CHECKING_AUTH) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-sm text-slate-500">Đang kiểm tra thông tin tài khoản...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Vui lòng đăng nhập để xem lịch sử đơn hàng</h2>
        <p className="text-sm text-slate-500 mb-6">Đăng nhập tài khoản để quản lý đơn hàng, theo dõi tiến độ và nhận ưu đãi riêng.</p>
        <Button type="primary" onClick={() => navigate("/login?redirect=/orders")} className="bg-blue-600 hover:bg-blue-500! rounded-xl h-11 px-8 font-semibold">
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Đơn hàng của tôi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
              {totalCount} đơn hàng
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý toàn bộ lịch sử mua sắm, trạng thái vận chuyển và bảo hành chính hãng.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full md:w-auto">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo mã đơn, người nhận, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="rounded-xl h-10 text-xs sm:w-64"
          />
          <Button
            type="primary"
            htmlType="submit"
            className="bg-slate-900 hover:bg-slate-800! rounded-xl h-10 px-4 text-xs font-semibold"
          >
            Tìm
          </Button>
        </form>
      </div>

      {guestId && unmergedCount > 0 && (
        <div className="mb-6">
          <GuestOrderMergeBanner
            guestId={guestId}
            unmergedCount={unmergedCount}
            onMergedSuccess={() => {
              fetchOrders(currentPage, activeTab, activeSearch);
              setUnmergedCount(0);
            }}
          />
        </div>
      )}

      <div className="mb-6 border-b border-slate-200">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="order-tabs"
        />
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-sm text-slate-500">Đang tải danh sách đơn hàng...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeSearch
                ? `Không tìm thấy đơn hàng nào khớp với từ khóa "${activeSearch}".`
                : "Không tìm thấy đơn hàng nào trong mục này."
            }
            className="mb-4"
          />
          <div className="flex justify-center gap-3">
            {activeSearch && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setActiveSearch("");
                  setCurrentPage(1);
                }}
                className="rounded-xl font-medium"
              >
                Xóa bộ lọc tìm kiếm
              </Button>
            )}
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />} className="bg-blue-600 hover:bg-blue-500! rounded-xl font-medium">
                Khám phá sản phẩm Apple ngay
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-extrabold text-blue-600 tracking-wide text-sm bg-blue-50 px-2.5 py-1 rounded-lg">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CalendarOutlined />
                    {new Date(order.placedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Người nhận: <span className="font-semibold text-slate-700">{order.recipientName}</span> ({order.recipientPhone})
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="text-xs text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <EnvironmentOutlined className="text-slate-400" />
                    <span>Khu vực giao: <span className="font-medium text-slate-700">{order.shippingProvince}</span></span>
                  </div>
                  <div>
                    Hình thức: <span className="font-medium text-slate-700">{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : order.paymentMethod}</span>
                  </div>
                  {order.voucherCode && (
                    <div className="text-emerald-600 font-medium flex items-center gap-1.5">
                      <span>Mã voucher:</span>
                      <Tag color="success" className="text-[10px] rounded font-semibold m-0">{order.voucherCode}</Tag>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center items-end justify-between md:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-slate-400">Tổng thanh toán</div>
                    <div className="font-black text-slate-900 text-lg">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.canRepay && (
                      <Button
                        type="primary"
                        size="middle"
                        icon={<CreditCardOutlined />}
                        loading={repayingOrderId === order.id}
                        onClick={() => handleRepay(order.id)}
                        className="bg-blue-600 hover:bg-blue-500! rounded-xl font-medium text-xs h-9 text-white shadow-sm shadow-blue-500/20"
                      >
                        Thanh toán lại VNPAY
                      </Button>
                    )}

                    {(order.canCancel ?? (order.status.toUpperCase() === "PENDING" && order.paymentStatus.toUpperCase() !== "PAID")) && (
                      <Button
                        danger
                        size="middle"
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleOpenCancelModal(order.id, order.orderNumber)}
                        className="rounded-xl font-medium text-xs h-9"
                      >
                        Hủy đơn
                      </Button>
                    )}

                    {order.status.toUpperCase() === "DELIVERED" && (
                      <Popconfirm
                        title="Xác nhận đã nhận hàng"
                        description="Bạn xác nhận đã nhận được kiện hàng nguyên vẹn và đầy đủ sản phẩm?"
                        onConfirm={() => handleConfirmReceived(order.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                      >
                        <Button
                          type="primary"
                          size="middle"
                          icon={<CheckCircleOutlined />}
                          loading={isConfirming}
                          className="bg-emerald-600 hover:bg-emerald-500! rounded-xl font-medium text-xs h-9 text-white"
                        >
                          Đã nhận hàng
                        </Button>
                      </Popconfirm>
                    )}

                    <Button
                      type="default"
                      size="middle"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetail(order.id)}
                      className="rounded-xl border-slate-200 hover:border-blue-500 hover:text-blue-600 font-medium text-xs h-9"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="py-6 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={totalCount}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} đơn hàng`}
            />
          </div>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={720}
        className="max-w-[95vw] sm:max-w-180"
        styles={{
          body: {
            maxHeight: "calc(85vh - 110px)",
            overflowY: "auto",
            paddingRight: "6px",
          },
        }}
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-slate-100">
            <ShoppingOutlined className="text-blue-600" />
            <span>Chi tiết đơn hàng {selectedOrder?.orderNumber}</span>
          </div>
        }
        centered
      >
        {isDetailLoading || !selectedOrder ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Spin size="default" />
            <span className="text-sm text-slate-500">Đang tải thông tin đơn hàng...</span>
          </div>
        ) : (
          <div className="py-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50/80 rounded-xl">
              <div>
                <span className="text-xs text-slate-400 block">Trạng thái đơn:</span>
                <div className="mt-1">
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Thanh toán:</span>
                <div className="mt-1">
                  <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Phương thức thanh toán:</span>
                <span className="font-semibold text-slate-700 text-xs mt-1 block">
                  {selectedOrder.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : selectedOrder.paymentMethod}
                </span>
              </div>
            </div>

            {selectedOrder.status.toLowerCase() !== "cancelled" ? (
              <div className="py-3 px-1">
                <Steps
                  current={getStepCurrent(selectedOrder.status)}
                  size="small"
                  className="ant-steps-horizontal"
                  items={[
                    { title: "Chờ xử lý", icon: <ClockCircleOutlined /> },
                    { title: "Đã xác nhận", icon: <CheckCircleFilled /> },
                    { title: "Đang giao", icon: <CarOutlined /> },
                    { title: "Đã giao", icon: <SmileOutlined /> },
                    { title: "Đã nhận hàng", icon: <CheckCircleOutlined /> },
                  ]}
                />
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center text-xs text-red-600 font-semibold">
                Đơn hàng này hiện đã ở trạng thái ĐÃ HỦY.
              </div>
            )}

            {(selectedOrder.status.toLowerCase() === "delivered" || selectedOrder.status.toLowerCase() === "completed") && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-800 block mb-1">
                  Lưu ý nhận hàng & Chính sách đổi trả:
                </span>
                Quý khách vui lòng quay video rõ nét khi mở kiện hàng. Nếu phát sinh lỗi hoặc có nhu cầu Đổi trả / Hoàn tiền trong vòng <strong className="text-amber-950 font-bold">15 ngày</strong> kể từ khi nhận hàng, vui lòng liên hệ ngay bộ phận CSKH qua Hotline <strong>1900 8888</strong> hoặc Email <strong>cskh@applestore.vn</strong> để được tiếp nhận hỗ trợ nhanh nhất.
              </div>
            )}

            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Lịch sử tiến trình đơn hàng
                </h3>
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <Timeline
                    className="mt-1"
                    items={selectedOrder.statusHistory.map((h) => ({
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông tin nhận hàng
                </h3>
                {selectedOrder.status.toLowerCase() === "pending" && (
                  (selectedOrder.shippingAddressUpdateCount ?? 0) === 0 ? (
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={handleOpenEditAddress}
                      className="text-xs text-blue-600 hover:text-blue-500 font-semibold p-0 h-auto flex items-center gap-1"
                    >
                      Đổi địa chỉ nhận hàng
                    </Button>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Đã cập nhật địa chỉ (1/1 lần)
                    </span>
                  )
                )}
              </div>
              <div className="p-3.5 bg-slate-50/70 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-slate-400" />
                  <span className="font-semibold text-slate-800">{selectedOrder.recipientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneOutlined className="text-slate-400" />
                  <span>{selectedOrder.recipientPhone}</span>
                </div>
                {selectedOrder.recipientEmail && (
                  <div className="flex items-center gap-2">
                    <MailOutlined className="text-slate-400" />
                    <span>{selectedOrder.recipientEmail}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 pt-1">
                  <EnvironmentOutlined className="text-slate-400 mt-0.5" />
                  <span>
                    {selectedOrder.shippingAddressLine}
                    {selectedOrder.shippingWard ? `, ${selectedOrder.shippingWard}` : ""}
                    {selectedOrder.shippingDistrict ? `, ${selectedOrder.shippingDistrict}` : ""}
                    {`, ${selectedOrder.shippingProvince}`}
                  </span>
                </div>
                {selectedOrder.customerNote && (
                  <div className="pt-2 text-slate-500 italic">
                    Ghi chú: "{selectedOrder.customerNote}"
                  </div>
                )}
              </div>
              {selectedOrder.status.toLowerCase() === "pending" && (selectedOrder.shippingAddressUpdateCount ?? 0) === 0 && (
                <div className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1 px-1">
                  <span>*</span>
                  <span>Quý khách được phép đổi thông tin địa chỉ, SĐT, email nhận hàng 1 lần duy nhất khi đơn đang chờ xử lý.</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Danh sách sản phẩm ({selectedOrder.items?.length || 0})
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl p-3">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {item.thumbnailUrl && !imageErrors[item.id] ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                          onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
                        />
                      ) : (
                        <AppleLogo size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-slate-800 truncate">{item.productName}</div>
                      <div className="text-slate-400 mt-0.5">
                        {item.variantName || `${item.colorName || ""} ${item.storageName || ""}`.trim()}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        SL: <span className="font-semibold text-slate-700">{item.quantity}</span> x {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 text-xs shrink-0">
                      {formatCurrency(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính hàng:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Giảm giá ({selectedOrder.voucherCode}):</span>
                  <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <Divider className="my-2" />
              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Tổng cộng:</span>
                <span className="text-blue-600 text-base">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedOrder.canRepay && (
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    loading={repayingOrderId === selectedOrder.id}
                    onClick={() => handleRepay(selectedOrder.id)}
                    className="bg-blue-600 hover:bg-blue-500! rounded-xl font-medium text-xs text-white"
                  >
                    Thanh toán lại qua VNPAY
                  </Button>
                )}

                {(selectedOrder.canCancel ?? (selectedOrder.status.toLowerCase() === "pending" && selectedOrder.paymentStatus.toLowerCase() !== "paid")) && (
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleOpenCancelModal(selectedOrder.id, selectedOrder.orderNumber)}
                    className="rounded-xl font-medium text-xs"
                  >
                    Hủy đơn hàng
                  </Button>
                )}

                {selectedOrder.status.toLowerCase() === "delivered" && (
                  <Popconfirm
                    title="Xác nhận đã nhận hàng"
                    description="Bạn xác nhận đã nhận được kiện hàng nguyên vẹn và đầy đủ sản phẩm?"
                    onConfirm={() => handleConfirmReceived(selectedOrder.id)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                  >
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={isConfirming}
                      className="bg-emerald-600 hover:bg-emerald-500! rounded-xl font-medium text-xs text-white"
                    >
                      Đã nhận được hàng
                    </Button>
                  </Popconfirm>
                )}
              </div>

              <Button
                type="default"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-medium text-xs ml-auto"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={cancelModalOpen}
        onCancel={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        onOk={handleConfirmCancelOrder}
        confirmLoading={isCancelling}
        okText="Xác nhận hủy đơn"
        okButtonProps={{ danger: true }}
        cancelText="Đóng"
        title="Lý do hủy đơn hàng"
        centered
        width={480}
      >
        <div className="py-2 space-y-3 text-xs">
          <p className="text-slate-600">
            Vui lòng chọn lý do quý khách muốn hủy đơn hàng <strong>{orderToCancel?.orderNumber}</strong>:
          </p>

          <Radio.Group
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full space-y-2"
          >
            {PRESET_CANCEL_REASONS.map((reason) => (
              <Radio key={reason} value={reason} className="block text-xs text-slate-700">
                {reason}
              </Radio>
            ))}
          </Radio.Group>

          {selectedReason === "Khác" && (
            <div className="pt-1">
              <Input.TextArea
                placeholder="Vui lòng nhập lý do cụ thể của bạn..."
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={isEditAddressOpen}
        onCancel={() => setIsEditAddressOpen(false)}
        footer={null}
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-slate-100">
            <EnvironmentOutlined className="text-blue-600" />
            <span>Chỉnh sửa thông tin giao nhận ({selectedOrder?.orderNumber})</span>
          </div>
        }
        centered
        width={520}
      >
        <div className="pt-3">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Quý khách vui lòng kiểm tra kỹ thông tin trước khi lưu. Mỗi đơn hàng chỉ được phép cập nhật thông tin giao nhận <strong>1 lần duy nhất</strong> khi đang ở trạng thái Chờ xử lý.
          </p>

          <Form
            form={addressForm}
            layout="vertical"
            onFinish={handleSaveEditAddress}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="recipientName"
                label={<span className="text-xs font-semibold text-slate-700">Họ và tên người nhận</span>}
                rules={[{ required: true, message: "Vui lòng nhập họ và tên người nhận" }]}
              >
                <Input placeholder="Nguyễn Văn A" className="rounded-xl text-xs h-9" />
              </Form.Item>

              <Form.Item
                name="recipientPhone"
                label={<span className="text-xs font-semibold text-slate-700">Số điện thoại nhận hàng</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^(0[3|5|7|8|9])[0-9]{8}$/, message: "Số điện thoại không đúng định dạng Việt Nam" },
                ]}
              >
                <Input placeholder="0912345678" className="rounded-xl text-xs h-9" />
              </Form.Item>
            </div>

            <Form.Item
              name="recipientEmail"
              label={<span className="text-xs font-semibold text-slate-700">Email nhận hóa đơn (tùy chọn)</span>}
              rules={[{ type: "email", message: "Email không đúng định dạng" }]}
            >
              <Input placeholder="email@example.com" className="rounded-xl text-xs h-9" />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                name="shippingProvince"
                label={<span className="text-xs font-semibold text-slate-700">Tỉnh / Thành phố</span>}
                rules={[{ required: true, message: "Vui lòng nhập Tỉnh/TP" }]}
              >
                <Input placeholder="Hà Nội" className="rounded-xl text-xs h-9" />
              </Form.Item>

              <Form.Item
                name="shippingDistrict"
                label={<span className="text-xs font-semibold text-slate-700">Quận / Huyện</span>}
              >
                <Input placeholder="Ba Đình" className="rounded-xl text-xs h-9" />
              </Form.Item>

              <Form.Item
                name="shippingWard"
                label={<span className="text-xs font-semibold text-slate-700">Phường / Xã</span>}
              >
                <Input placeholder="Điện Biên" className="rounded-xl text-xs h-9" />
              </Form.Item>
            </div>

            <Form.Item
              name="shippingAddressLine"
              label={<span className="text-xs font-semibold text-slate-700">Địa chỉ cụ thể (Số nhà, tên đường...)</span>}
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết" }]}
            >
              <Input placeholder="Số 123 Đường Liễu Giai" className="rounded-xl text-xs h-9" />
            </Form.Item>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                onClick={() => setIsEditAddressOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSavingAddress}
                className="bg-blue-600 hover:bg-blue-500! rounded-xl text-xs h-9 font-semibold px-5"
              >
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default MyOrdersPage;
