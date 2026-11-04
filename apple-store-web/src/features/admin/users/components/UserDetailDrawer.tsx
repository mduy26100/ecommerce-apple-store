import { Drawer, Descriptions, Tag, Avatar, Spin, Divider } from "antd";
import { UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useUserDetail } from "../hooks/useUsers";

interface UserDetailDrawerProps {
  open: boolean;
  userId?: number;
  onClose: () => void;
}

export const UserDetailDrawer = ({ open, userId, onClose }: UserDetailDrawerProps) => {
  const { data: user, isLoading } = useUserDetail(open ? userId : undefined);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Chi Tiết Hồ Sơ Người Dùng"
      width={480}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spin tip="Đang tải dữ liệu hồ sơ..." />
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Avatar
              size={64}
              src={user.avatarUrl || undefined}
              icon={<UserOutlined className="text-2xl text-slate-400" />}
              className="border border-slate-200 bg-white shrink-0"
            />
            <div>
              <h4 className="text-base font-bold text-slate-800 leading-tight">
                {user.fullName || user.userName}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                {user.isLocked ? (
                  <Tag color="red">
                    Đang bị khóa ({user.lockoutDaysRemaining ? `còn ${user.lockoutDaysRemaining} ngày` : "Tạm khóa"})
                  </Tag>
                ) : (
                  <Tag color="green">Đang hoạt động</Tag>
                )}
                {user.emailConfirmed ? (
                  <Tag color="blue">Email đã xác minh</Tag>
                ) : (
                  <Tag color="orange">Chưa xác minh email</Tag>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
                <ShoppingOutlined />
                <span>Tổng đơn hàng</span>
              </span>
              <p className="text-lg font-bold text-blue-900 mt-1">
                {user.totalOrders} <span className="text-xs font-normal text-blue-700">đơn</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <span className="text-xs text-emerald-600 font-medium">Tổng tiền đã chi</span>
              <p className="text-lg font-bold text-emerald-900 mt-1">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(user.totalSpent)}
              </p>
            </div>
          </div>

          <Divider className="my-4 border-slate-100" />

          <Descriptions title={<span className="text-sm font-bold text-slate-800">Thông Tin Định Danh</span>} column={1} size="small" bordered>
            <Descriptions.Item label="Mã tài khoản (ID)">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Họ và tên">{user.fullName}</Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">{user.userName}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{user.phoneNumber || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Thời hạn khóa">
              {user.lockoutEnd ? (
                <span className="text-red-600 font-medium">
                  {new Date(user.lockoutEnd).toLocaleString("vi-VN")}
                </span>
              ) : (
                "Không khóa"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn hàng gần nhất">
              {user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleString("vi-VN") : "Chưa có đơn hàng nào"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : null}
    </Drawer>
  );
};

export default UserDetailDrawer;

