import { Layout } from "antd";

const { Footer } = Layout;

export const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer className="bg-slate-50 border-t border-slate-200/50 py-4 px-6 text-center select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto text-slate-400 text-xs">
        <p className="font-medium">
          &copy; {currentYear} <span className="text-slate-600 font-semibold">Cổng Quản Trị Apple Store Việt Nam</span>. Bảo lưu mọi quyền.
        </p>
        <div className="flex gap-4">
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Chính sách bảo mật</span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Điều khoản quản trị</span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Trung tâm hỗ trợ</span>
        </div>
      </div>
    </Footer>
  );
};

export default AdminFooter;
