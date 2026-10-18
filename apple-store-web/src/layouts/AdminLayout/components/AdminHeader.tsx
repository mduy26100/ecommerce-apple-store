import { useState, useEffect, useRef } from "react";
import { Layout, Button, Badge, Dropdown, Input, Tooltip } from "antd";
import { useNavigate, Link } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useAuthStore, useLogout } from "@features/auth";

const { Header } = Layout;

interface AdminHeaderProps {
  collapsed: boolean;
  onCollapseToggle: () => void;
  onMobileToggle: () => void;
}

export const AdminHeader = ({
  collapsed,
  onCollapseToggle,
  onMobileToggle,
}: AdminHeaderProps) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const searchPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target as Node)) {
        setSearchVisible(false);
      }
    };

    if (searchVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchVisible]);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      logout();
    } else if (key === "profile") {
      navigate("/admin/profile");
    } else if (key === "settings") {
      navigate("/admin/settings");
    }
  };

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ của tôi",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
    },
  ];

  const notificationMenu = (
    <div className="w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <span className="font-semibold text-slate-800 text-sm">Thông báo</span>
        <span className="text-xs text-blue-600 hover:underline cursor-pointer">Đã đọc tất cả</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors duration-150">
          <p className="text-xs font-semibold text-slate-800">Đơn hàng mới từ Storefront</p>
          <p className="text-xxs text-slate-500 mt-0.5">Khách hàng vừa đặt mua iPhone 16 Pro Max 256GB.</p>
          <span className="text-xxs text-slate-400 block mt-1">2 phút trước</span>
        </div>
        <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors duration-150">
          <p className="text-xs font-semibold text-slate-800">Sao lưu dữ liệu hoàn tất</p>
          <p className="text-xxs text-slate-500 mt-0.5">Bản sao lưu cơ sở dữ liệu đã tải lên lưu trữ an toàn.</p>
          <span className="text-xxs text-slate-400 block mt-1">1 giờ trước</span>
        </div>
      </div>
      <div className="px-4 py-2 text-center bg-slate-50 border-t border-slate-100">
        <span className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium">Xem tất cả thông báo</span>
      </div>
    </div>
  );

  return (
    <Header className="sticky top-0 right-0 z-20 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-slate-200/60 shadow-xs select-none">
      {searchVisible && (
        <div ref={searchPanelRef} className="absolute inset-0 z-30 bg-white flex items-center px-4 gap-3 animate-fade-in">
          <SearchOutlined className="text-slate-400 text-lg ml-2" />
          <Input
            autoFocus
            placeholder="Nhập từ khóa tìm kiếm nhanh..."
            className="flex-1 bg-slate-50 border-slate-200 rounded-lg py-1.5 px-3 text-xs"
          />
          <Button
            type="text"
            onClick={() => setSearchVisible(false)}
            className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
          >
            Đóng
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onCollapseToggle}
            className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-lg"
          />
        </div>

        <div className="block md:hidden">
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={onMobileToggle}
            className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-lg"
          />
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-colors"
        >
          <ShopOutlined className="text-sm" />
          <span>Xem Cửa Hàng</span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <Tooltip title="Tìm kiếm">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => setSearchVisible(true)}
            className="flex lg:hidden items-center justify-center w-8 h-8 text-slate-500 hover:bg-slate-100 rounded-lg"
          />
        </Tooltip>

        <Dropdown dropdownRender={() => notificationMenu} trigger={["click"]} placement="bottomRight">
          <Badge count={2} size="small" offset={[-2, 2]} className="cursor-pointer">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="flex items-center justify-center w-8 h-8 text-slate-500 hover:bg-slate-100 rounded-lg"
            />
          </Badge>
        </Dropdown>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        <Dropdown menu={{ items: profileMenuItems, onClick: handleMenuClick }} trigger={["click"]} placement="bottomRight">
          <div className="flex items-center gap-3 pl-1.5 py-1 pr-1 sm:pr-2 hover:bg-slate-50 rounded-lg cursor-pointer select-none transition-all duration-150">
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                alt="User"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-800 leading-tight">{user?.fullName || "Quản trị viên"}</span>
              <span className="text-xs text-slate-500 font-medium leading-tight">{user?.role || "SuperAdmin"}</span>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AdminHeader;
