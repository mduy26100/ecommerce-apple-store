import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Badge, Drawer } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@features/auth";

export const StorefrontHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const categories = [
    { label: "iPhone", path: "/#iphone" },
    { label: "MacBook", path: "/#macbook" },
    { label: "iPad", path: "/#ipad" },
    { label: "Apple Watch", path: "/#watch" },
    { label: "Tai nghe & AirPods", path: "/#airpods" },
    { label: "Phụ kiện", path: "/#accessories" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 text-slate-700"
          />

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform duration-200">
              
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
        </div>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href={cat.path}
              className="text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-150"
            >
              {cat.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/admin/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors duration-200"
          >
            <SafetyCertificateOutlined className="text-sm" />
            <span>Trang Quản trị</span>
          </Link>

          <Button
            type="text"
            icon={<SearchOutlined />}
            className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-base"
          />

          <Badge count={0} showZero={false} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg text-lg"
            />
          </Badge>

          {user ? (
            <div
              onClick={() => navigate("/admin/profile")}
              className="flex items-center gap-2 pl-2 py-1 pr-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-slate-800">
                {user.fullName || "Tài khoản"}
              </span>
            </div>
          ) : (
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={() => navigate("/auth/login")}
              className="bg-blue-600 hover:bg-blue-700 h-9 rounded-xl text-xs font-semibold border-none shadow-xs"
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-base">Apple Store</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">Chính hãng</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col p-4 gap-2">
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

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Danh mục mua sắm
          </div>

          {categories.map((cat) => (
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
              <Button
                type="default"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/admin/profile");
                }}
                className="w-full text-xs font-semibold h-9 rounded-lg"
              >
                Hồ sơ tài khoản ({user.fullName || "Quản trị"})
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/auth/login");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold h-9 rounded-lg border-none"
              >
                Đăng nhập tài khoản
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default StorefrontHeader;
