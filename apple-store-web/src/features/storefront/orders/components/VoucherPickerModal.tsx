import React from "react";
import { Modal, Button, Tag, Empty, Spin } from "antd";
import { GiftOutlined, CalendarOutlined, CheckOutlined } from "@ant-design/icons";
import type { UserVoucher } from "../types/order.types";

interface VoucherPickerModalProps {
  open: boolean;
  onClose: () => void;
  vouchers: UserVoucher[];
  isLoading: boolean;
  selectedCode?: string | null;
  onSelect: (code: string) => void;
  subtotal: number;
}

export const VoucherPickerModal: React.FC<VoucherPickerModalProps> = ({
  open,
  onClose,
  vouchers,
  isLoading,
  selectedCode,
  onSelect,
  subtotal,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-2 border-b border-slate-100">
          <GiftOutlined className="text-blue-600 text-lg" />
          <span>Ví Voucher & Ưu Đãi Của Bạn</span>
        </div>
      }
      width={560}
      centered
    >
      <div className="py-2">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Spin size="default" />
            <span className="text-sm text-slate-500">Đang tải danh sách ưu đãi...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Hiện chưa có mã giảm giá khả dụng nào trong ví của bạn"
            className="py-8"
          />
        ) : (
          <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
            {vouchers.map((item) => {
              const isSelected = selectedCode?.toUpperCase() === item.code.toUpperCase();
              const isEligible = !item.minOrderAmount || subtotal >= item.minOrderAmount;

              return (
                <div
                  key={item.id || item.code}
                  className={`border rounded-xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 shadow-xs"
                      : isEligible
                      ? "border-slate-200 hover:border-blue-300 bg-white"
                      : "border-slate-200 bg-slate-50/60 opacity-60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-extrabold text-blue-600 text-sm tracking-wide bg-blue-100/70 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      {item.targetType === "RegisteredOnly" && (
                        <Tag color="cyan" className="rounded-full text-xs">Thành viên</Tag>
                      )}
                      {item.targetType === "AssignedOnly" && (
                        <Tag color="gold" className="rounded-full text-xs">Đặc quyền VIP</Tag>
                      )}
                      <Tag color="purple" className="rounded-full text-xs font-semibold">
                        Còn {item.remainingUses} lượt dùng
                      </Tag>
                    </div>
                    <div className="font-semibold text-slate-800 text-sm truncate">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</div>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined />
                        Hạn: {new Date(item.expiresAt).toLocaleDateString("vi-VN")}
                      </span>
                      {item.minOrderAmount && (
                        <span>Đơn từ {formatCurrency(item.minOrderAmount)}</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {isSelected ? (
                      <Button
                        type="primary"
                        size="middle"
                        icon={<CheckOutlined />}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500! font-medium"
                        onClick={onClose}
                      >
                        Đang chọn
                      </Button>
                    ) : (
                      <Button
                        type={isEligible ? "primary" : "default"}
                        size="middle"
                        disabled={!isEligible}
                        className={`rounded-lg font-medium ${
                          isEligible ? "bg-blue-600 hover:bg-blue-500!" : ""
                        }`}
                        onClick={() => {
                          onSelect(item.code);
                          onClose();
                        }}
                      >
                        Áp dụng
                      </Button>
                    )}
                    {!isEligible && item.minOrderAmount && (
                      <span className="text-[11px] text-amber-600 font-medium">
                        Chưa đủ {formatCurrency(item.minOrderAmount)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
