import { Button, message } from "antd";
import { Link } from "react-router-dom";
import {
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useFeaturedProducts, useCategories, ProductCard } from "@features/storefront/catalog";
import type { Product } from "@features/storefront/catalog";
import { AppleLogo } from "@shared/components/icons";

export const HomePage = () => {
  const { data: products, isLoading: isProductsLoading } = useFeaturedProducts();
  const { data: categories } = useCategories();

  const handleAddToCart = (product: Product) => {
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleBuyNow = (product: Product) => {
    message.success(`Đang chuyển tới trang thanh toán cho "${product.name}"...`);
  };

  return (
    <div className="space-y-16 pb-12 select-none">
      <section className="relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-black text-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Sản Phẩm Apple Chính Hãng Mới Nhất 2026
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-tight">
            iPhone 16 Pro &amp; Pro Max
          </h1>

          <p className="text-lg sm:text-2xl font-medium text-slate-300 mt-3 tracking-wide">
            Thiết kế Titan sa mạc đẳng cấp. Sức mạnh chip A18 Pro.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-4 leading-relaxed">
            Trải nghiệm Nút Điều Khiển Camera thế hệ mới cùng chuẩn quay phim 4K 120 fps Dolby Vision chuyên nghiệp nhất từ trước tới nay.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={() => message.success("Đang mở đặt trước iPhone 16 Pro Max!")}
              className="bg-blue-600 hover:bg-blue-500 border-none h-12 px-8 rounded-full font-bold text-sm shadow-lg shadow-blue-500/30"
            >
              Mua ngay từ 34.990.000₫
            </Button>

            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-semibold text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            >
              <SafetyCertificateOutlined />
              <span>Vào Cổng Quản trị Admin</span>
            </Link>
          </div>

          <div className="mt-12 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1200"
              alt="Apple iPhone 16 Pro"
              className="w-full h-72 sm:h-96 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Khám Phá Theo Nhóm
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Danh Mục Sản Phẩm Apple
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Tất cả thiết bị đều được nhập khẩu chính ngạch, nguyên seal và bảo hành chính hãng AppleCare Việt Nam.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories?.map((cat) => (
            <div
              key={cat.id}
              className="group flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-blue-600 mb-3 transition-colors">
                <AppleLogo size={22} className="text-blue-600 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat.productCount} sản phẩm
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Sản Phẩm Đang Bán
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Thiết Bị Nổi Bật &amp; Bán Chạy
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
            <span>Xem toàn bộ sản phẩm</span>
            <ArrowRightOutlined />
          </div>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 flex flex-col justify-between min-h-95">
            <div className="relative z-10">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Đỉnh Cao Hiệu Năng
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 mb-3">
                MacBook Pro M4 Series
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
                Được trang bị chip M4, M4 Pro và M4 Max. Xử lý tác vụ đồ họa và lập trình chuyên sâu mượt mà chưa từng thấy.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <span className="text-xl font-bold block mb-4 text-white">
                Giá từ 39.990.000₫
              </span>
              <Button
                type="primary"
                onClick={() => message.success("Đang mở chi tiết MacBook Pro M4!")}
                className="bg-white hover:bg-slate-100 text-slate-900 border-none font-bold rounded-xl h-10 px-6 text-xs"
              >
                Khám phá ngay
              </Button>
            </div>

            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 md:opacity-30 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600"
                alt="MacBook Pro"
                className="w-full h-full object-cover object-left"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between min-h-95">
            <div className="relative z-10">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Sáng Tạo Không Giới Hạn
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 mb-3">
                iPad Pro M4 Mỏng Kỷ Lục
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
                Màn hình Ultra Retina XDR Tandem OLED hai lớp đột phá cùng Apple Pencil Pro thế hệ mới.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <span className="text-xl font-bold block mb-4 text-white">
                Giá từ 28.990.000₫
              </span>
              <Button
                type="primary"
                onClick={() => message.success("Đang mở chi tiết iPad Pro M4!")}
                className="bg-white hover:bg-slate-100 text-slate-900 border-none font-bold rounded-xl h-10 px-6 text-xs"
              >
                Khám phá ngay
              </Button>
            </div>

            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 md:opacity-30 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600"
                alt="iPad Pro"
                className="w-full h-full object-cover object-left"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
              <CheckCircleFilled />
              Hệ Thống Phân Phối &amp; Quản Lý Toàn Diện
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Khu Vực Dành Cho Ban Quản Trị Hệ Thống
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
              Bạn là nhân viên hoặc quản trị viên của Apple Store? Truy cập hệ thống quản lý kho hàng, đơn đặt hàng, quản trị người dùng và cấu hình dịch vụ tại cổng quản trị.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-blue-600 font-bold px-6 py-3.5 rounded-xl text-xs shadow-lg transition-all"
            >
              <SafetyCertificateOutlined className="text-base" />
              <span>Truy Cập Cổng Quản Trị (/admin)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
