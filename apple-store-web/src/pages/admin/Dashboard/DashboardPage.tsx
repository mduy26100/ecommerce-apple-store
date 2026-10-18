import React from "react";
import PageHeader from "@shared/components/page-header/PageHeader";

interface StatCard {
  title: string;
  value: string;
  trend: string;
  trendType: "up" | "down";
  icon: React.ReactNode;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  date: string;
  status: "Thành công" | "Đang xử lý" | "Thất bại" | "Cảnh báo";
}

interface SystemMetric {
  name: string;
  usage: number;
  color: string;
}

const STAT_CARDS: StatCard[] = [
  {
    title: "Tổng Người Dùng",
    value: "12,540",
    trend: "+12.5%",
    trendType: "up",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Doanh Thu Cửa Hàng",
    value: "1.250.000.000₫",
    trend: "+18.4%",
    trendType: "up",
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Đơn Hàng Hôm Nay",
    value: "148",
    trend: "+8.2%",
    trendType: "up",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Tải Hệ Thống",
    value: "38.5%",
    trend: "-2.0%",
    trendType: "down",
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
];

const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: "ACT-001",
    user: "Quản trị viên Apple",
    action: "Cập nhật chính sách giá iPhone 16 Pro Max",
    date: "10 phút trước",
    status: "Thành công",
  },
  {
    id: "ACT-002",
    user: "Nguyễn Văn Nam",
    action: "Tạo mới tài khoản quản lý chi nhánh Hà Nội",
    date: "1 giờ trước",
    status: "Thành công",
  },
  {
    id: "ACT-003",
    user: "Trần Thị Mai",
    action: "Điều chỉnh hạn mức tồn kho MacBook Pro M4",
    date: "3 giờ trước",
    status: "Cảnh báo",
  },
  {
    id: "ACT-004",
    user: "Hệ thống tự động",
    action: "Sao lưu định kỳ cơ sở dữ liệu lên đám mây",
    date: "5 giờ trước",
    status: "Thành công",
  },
  {
    id: "ACT-005",
    user: "Lê Hoàng Phúc",
    action: "Cập nhật thông tin chiết khấu đối tác AppleCare",
    date: "1 ngày trước",
    status: "Đang xử lý",
  },
];

const SYSTEM_METRICS: SystemMetric[] = [
  { name: "Hiệu năng CPU", usage: 38, color: "bg-blue-600" },
  { name: "Bộ nhớ RAM", usage: 62, color: "bg-indigo-600" },
  { name: "Dung lượng đĩa lưu trữ", usage: 24, color: "bg-emerald-600" },
];

export const DashboardPage = () => {
  return (
    <div className="flex flex-col w-full select-none">
      <PageHeader breadcrumbs={["HỆ THỐNG", "TỔNG QUAN"]} title="Bảng Điều Khiển Quản Trị" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-2">
        {STAT_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {card.title}
              </span>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <div className="flex items-center gap-1 text-xxs font-bold">
                <span className={card.trendType === "up" ? "text-green-600" : "text-red-600"}>
                  {card.trend}
                </span>
                <span className="text-slate-400 font-medium">so tuần trước</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Tăng Trưởng Doanh Thu</h3>
            <p className="text-xxs text-slate-400 mt-0.5">Biểu đồ tổng hợp dữ liệu doanh số theo tuần và tháng.</p>
          </div>
          <div className="flex-1 min-h-70 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center mt-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold text-slate-500 mt-2">Dữ liệu doanh thu đang cập nhật</span>
            <span className="text-xxs text-slate-400 mt-0.5">Hệ thống sẽ đồng bộ trực tiếp khi kết nối API báo cáo.</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Trạng Thái Máy Chủ</h3>
            <p className="text-xxs text-slate-400 mt-0.5">Thông số giám sát tải hạ tầng thời gian thực.</p>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-5 mt-4">
            {SYSTEM_METRICS.map((metric, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xxs font-bold text-slate-500">
                  <span>{metric.name}</span>
                  <span className="text-slate-800 font-semibold">{metric.usage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                    style={{ width: `${metric.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-xs mt-4 sm:mt-6 flex flex-col">
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Nhật Ký Hoạt Động Gần Đây</h3>
          <p className="text-xxs text-slate-400 mt-0.5">Lịch sử kiểm toán các thao tác thay đổi cấu hình trên hệ thống.</p>
        </div>

        <div className="overflow-x-auto w-full custom-scrollbar mt-4 border border-slate-100 rounded-xl">
          <table className="w-full min-w-175 border-collapse text-left text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã thao tác</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Nội dung hoạt động</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_ACTIVITIES.map((act) => {
                let badgeClass = "bg-green-50 text-green-700 border-green-200/50";
                if (act.status === "Đang xử lý") {
                  badgeClass = "bg-amber-50 text-amber-700 border-amber-200/50";
                } else if (act.status === "Thất bại") {
                  badgeClass = "bg-red-50 text-red-700 border-red-200/50";
                } else if (act.status === "Cảnh báo") {
                  badgeClass = "bg-orange-50 text-orange-700 border-orange-200/50";
                }

                return (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-3 px-4 font-bold text-slate-800">{act.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{act.user}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{act.action}</td>
                    <td className="py-3 px-4 text-slate-400">{act.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 border rounded-full text-[10px] font-bold ${badgeClass}`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
