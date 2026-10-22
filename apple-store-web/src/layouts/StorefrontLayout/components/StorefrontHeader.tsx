import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Badge, Drawer, Dropdown } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuthStore, useLogout, AUTH_STATUS } from "@features/auth";
import { USER_ROLES } from "@core/constants/role.constants";
import { AppleLogo } from "@shared/components/icons";

const CATEGORIES = [
  { label: "iPhone", path: "/#iphone" },
  { label: "MacBook", path: "/#macbook" },
  { label: "iPad", path: "/#ipad" },
  { label: "Apple Watch", path: "/#watch" },
  { label: "Tai nghe & AirPods", path: "/#airpods" },
  { label: "Phụ kiện", path: "/#accessories" },
];

export const StorefrontHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const { mutate: logout } = useLogout();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleProfileClick = () => {
    if (isSuperAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/profile");
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "logout") {
      logout();
    }
  };

  const userMenuItems = useMemo(
    () => [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Thông tin tài khoản",
      },
      {
        type: "divider" as const,
      },
      {
        key: "logout",
        icon: <LogoutOutlined className="text-red-500" />,
        label: <span className="text-red-500 font-medium">Đăng xuất</span>,
      },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <AppleLogo size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-tight">
              Apple Store
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">
              Chính Hãng VN
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              href={cat.path}
              className="text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-150"
            >
              {cat.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {isSuperAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors duration-200"
            >
              <SafetyCertificateOutlined className="text-sm" />
              <span>Trang Quản trị</span>
            </Link>
          )}

          <Button
            type="text"
            icon={<SearchOutlined />}
            className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-base"
            aria-label="Tìm kiếm"
          />

          <Badge count={0} showZero={false} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-lg"
              aria-label="Giỏ hàng"
            />
          </Badge>

          <div className="hidden md:flex items-center">
            {status === AUTH_STATUS.CHECKING_AUTH ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              isSuperAdmin ? (
                <div
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 pl-2 py-1 pr-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  title="Cổng Quản trị"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold text-slate-800">
                    {user.fullName || "Quản trị viên"}
                  </span>
                </div>
              ) : (
                <Dropdown
                  menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                  trigger={["click"]}
                  arrow
                >
                  <div className="flex items-center gap-2 pl-2 py-1 pr-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span className="hidden xl:inline text-xs font-semibold text-slate-800">
                      {user.fullName || "Tài khoản"}
                    </span>
                  </div>
                </Dropdown>
              )
            ) : (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 h-9 rounded-xl text-xs font-semibold border-none shadow-xs"
              >
                Đăng nhập
              </Button>
            )}
          </div>

          <div className="block md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center w-9 h-9 text-slate-700 hover:bg-slate-100 rounded-lg text-lg"
              aria-label="Menu"
            />
          </div>
        </div>
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-base">Apple Store</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">Chính hãng</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        destroyOnClose
        rootClassName="md:!hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col p-4 gap-2">
          {isSuperAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl font-semibold text-xs mb-3 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SafetyCertificateOutlined className="text-base" />
                Truy cập Cổng Quản trị (Admin)
              </span>
              <span>&rarr;</span>
            </Link>
          )}

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Danh mục mua sắm
          </div>

          {CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              href={cat.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              <span>{cat.label}</span>
              <span className="text-slate-300">&rsaquo;</span>
            </a>
          ))}

          <div className="border-t border-slate-100 my-3 pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <Button
                  type="default"
                  onClick={() => {
                    setMobileOpen(false);
                    handleProfileClick();
                  }}
                  className="w-full text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2"
                >
                  <UserOutlined />
                  {isSuperAdmin ? "Cổng quản trị" : "Thông tin tài khoản"} ({user.fullName || "Tài khoản"})
                </Button>
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    setMobileOpen(false);
                    if (isSuperAdmin) {
                      logout(undefined, {
                        onSettled: () => {
                          navigate("/admin/auth/login");
                        },
                      });
                    } else {
                      logout();
                    }
                  }}
                  className="w-full text-xs font-semibold h-10 rounded-xl"
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold h-10 rounded-xl border-none shadow-sm flex items-center justify-center"
                >
                  Đăng nhập tài khoản
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/register");
                  }}
                  className="w-full text-xs font-semibold h-10 rounded-xl border-slate-200 text-slate-700"
                >
                  Tạo tài khoản mới
                </Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default StorefrontHeader;
