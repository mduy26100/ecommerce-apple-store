import { Link } from "react-router-dom";
import {
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  SyncOutlined,
  RocketOutlined,
} from "@ant-design/icons";

export const StorefrontFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs select-none mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center text-lg shrink-0">
              <RocketOutlined />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Giao hàng miễn phí</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng từ 1 triệu đồng.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center text-lg shrink-0">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Bảo hành 12 tháng</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Cam kết 100% sản phẩm Apple chính hãng với bảo hành toàn diện.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center text-lg shrink-0">
              <SyncOutlined />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Đổi mới 30 ngày</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Lỗi 1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi từ nhà sản xuất.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-purple-400 flex items-center justify-center text-lg shrink-0">
              <CustomerServiceOutlined />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Hỗ trợ 24/7</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Đội ngũ kỹ thuật viên chuyên nghiệp hỗ trợ tận tâm mọi lúc.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Sản phẩm Apple
            </h5>
            <ul className="space-y-2.5">
              <li><a href="/#iphone" className="hover:text-white transition-colors">iPhone 16 Series</a></li>
              <li><a href="/#iphone" className="hover:text-white transition-colors">iPhone 15 Series</a></li>
              <li><a href="/#macbook" className="hover:text-white transition-colors">MacBook Pro & Air</a></li>
              <li><a href="/#ipad" className="hover:text-white transition-colors">iPad Pro, Air & Gen 10</a></li>
              <li><a href="/#watch" className="hover:text-white transition-colors">Apple Watch Ultra & Series 10</a></li>
              <li><a href="/#airpods" className="hover:text-white transition-colors">AirPods & AirPods Max</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Chính sách bán hàng
            </h5>
            <ul className="space-y-2.5">
              <li><span className="hover:text-white cursor-pointer transition-colors">Chính sách bảo hành</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Chính sách đổi trả 30 ngày</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Chính sách vận chuyển</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Phương thức thanh toán</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Hướng dẫn mua hàng online</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Dịch vụ & Tiện ích
            </h5>
            <ul className="space-y-2.5">
              <li><span className="hover:text-white cursor-pointer transition-colors">Apple Care & Apple Care+</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Thu cũ đổi mới trợ giá cao</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Trả góp 0% lãi suất</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Dịch vụ doanh nghiệp</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Tra cứu hóa đơn điện tử</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Hệ thống & Quản trị
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5">
                  <SafetyCertificateOutlined />
                  <span>Cổng Quản trị Admin</span>
                </Link>
              </li>
              <li><span className="text-slate-400">Hotline: 1800 1199 (Miễn phí)</span></li>
              <li><span className="text-slate-400">Email: lienhe@urbanstitch.vn</span></li>
              <li><span className="text-slate-400">Giờ mở cửa: 08:00 - 22:00</span></li>
              <li><span className="text-slate-400">Trụ sở: Hà Nội & TP. Hồ Chí Minh</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            &copy; {currentYear} <span className="text-white font-semibold">Urban Stitch Việt Nam</span>. Đại lý ủy quyền chính thức.
          </p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Điều khoản dịch vụ</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-white cursor-pointer">Bảo mật thông tin</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-white cursor-pointer">Chính sách Cookie</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StorefrontFooter;
