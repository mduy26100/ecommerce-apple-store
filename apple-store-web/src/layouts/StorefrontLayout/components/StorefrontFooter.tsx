import { Link } from "react-router-dom";
import {
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  SyncOutlined,
  RocketOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export const StorefrontFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-500 text-xs select-none mt-16 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-12 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center text-lg shrink-0">
              <RocketOutlined />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">Giao hàng miễn phí</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng từ 1 triệu đồng.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 flex items-center justify-center text-lg shrink-0">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">Bảo hành 12 tháng</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Cam kết 100% sản phẩm Apple chính hãng với bảo hành toàn diện.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/60 flex items-center justify-center text-lg shrink-0">
              <SyncOutlined />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">Đổi mới 30 ngày</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Lỗi 1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi từ nhà sản xuất.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/60 flex items-center justify-center text-lg shrink-0">
              <CustomerServiceOutlined />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">Hỗ trợ 24/7</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Đội ngũ kỹ thuật viên chuyên nghiệp hỗ trợ tận tâm mọi lúc.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h5 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">
              Sản phẩm Apple
            </h5>
            <ul className="space-y-2.5">
              <li><Link to="/products?category=iphone" className="hover:text-blue-600 transition-colors">iPhone 16 Series</Link></li>
              <li><Link to="/products?category=iphone" className="hover:text-blue-600 transition-colors">iPhone 15 Series</Link></li>
              <li><Link to="/products?category=macbook" className="hover:text-blue-600 transition-colors">MacBook Pro & Air</Link></li>
              <li><Link to="/products?category=ipad" className="hover:text-blue-600 transition-colors">iPad Pro, Air & Gen 10</Link></li>
              <li><Link to="/products?category=apple-watch" className="hover:text-blue-600 transition-colors">Apple Watch Ultra & Series 10</Link></li>
              <li><Link to="/products?category=airpods-am-thanh" className="hover:text-blue-600 transition-colors">AirPods & Âm thanh</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">
              Chính sách bán hàng
            </h5>
            <ul className="space-y-2.5">
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Chính sách bảo hành</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Chính sách đổi trả 30 ngày</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Chính sách vận chuyển</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Phương thức thanh toán</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Hướng dẫn mua hàng online</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">
              Dịch vụ & Tiện ích
            </h5>
            <ul className="space-y-2.5">
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Apple Care & Apple Care+</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Thu cũ đổi mới trợ giá cao</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Trả góp 0% lãi suất</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Dịch vụ doanh nghiệp</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Tra cứu hóa đơn điện tử</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">
              Thông tin liên hệ
            </h5>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-slate-600">
                <PhoneOutlined className="text-blue-600 text-xs shrink-0" />
                <span>Hotline: <strong className="text-slate-900">1800 1199</strong> (Miễn phí)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <MailOutlined className="text-blue-600 text-xs shrink-0" />
                <span>Email: lienhe@urbanstitch.vn</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <ClockCircleOutlined className="text-blue-600 text-xs shrink-0" />
                <span>Giờ mở cửa: 08:00 - 22:00</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <EnvironmentOutlined className="text-blue-600 text-xs shrink-0" />
                <span>Hệ thống: Hà Nội &amp; TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            &copy; {currentYear} <span className="text-slate-900 font-semibold">Urban Stitch Việt Nam</span>. Đại lý ủy quyền chính thức Apple.
          </p>
          <div className="flex gap-4">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Điều khoản dịch vụ</span>
            <span className="text-slate-300">|</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Bảo mật thông tin</span>
            <span className="text-slate-300">|</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Chính sách Cookie</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StorefrontFooter;

