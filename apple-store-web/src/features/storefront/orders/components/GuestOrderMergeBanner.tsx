import React, { useState } from "react";
import { Alert, Button, message } from "antd";
import { LinkOutlined, CloseOutlined } from "@ant-design/icons";
import { orderApi } from "../api/order.api";

interface GuestOrderMergeBannerProps {
  guestId: string;
  unmergedCount: number;
  onMergedSuccess: () => void;
}

export const GuestOrderMergeBanner: React.FC<GuestOrderMergeBannerProps> = ({
  guestId,
  unmergedCount,
  onMergedSuccess,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  if (isDismissed || unmergedCount <= 0) {
    return null;
  }

  const handleMerge = async () => {
    try {
      setIsMerging(true);
      const res = await orderApi.mergeGuestOrders(guestId);
      message.success(`Đã đồng bộ thành công ${res.mergedCount || unmergedCount} đơn hàng vào tài khoản của bạn!`);
      onMergedSuccess();
      setIsDismissed(true);
    } catch {
      message.error("Không thể gộp đơn hàng vào lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="mb-6">
      <Alert
        message={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 text-sm">Phát hiện đơn hàng tự do trên thiết bị:</span>
              <p className="text-xs text-slate-600 mt-0.5">
                Chúng tôi nhận thấy bạn vừa có {unmergedCount} đơn hàng đặt tự do trên trình duyệt này. Bạn có muốn gộp vào tài khoản để dễ dàng theo dõi và bảo hành không?
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="primary"
                size="small"
                icon={<LinkOutlined />}
                loading={isMerging}
                onClick={handleMerge}
                className="bg-blue-600 hover:bg-blue-500! rounded-md font-medium text-xs h-8"
              >
                Gộp vào tài khoản
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setIsDismissed(true)}
                className="text-slate-400 hover:text-slate-600 rounded-md text-xs h-8"
              >
                Để sau
              </Button>
            </div>
          </div>
        }
        type="info"
        showIcon
        className="border-blue-200 bg-blue-50/80 rounded-xl py-3 px-4 shadow-2xs"
      />
    </div>
  );
};
