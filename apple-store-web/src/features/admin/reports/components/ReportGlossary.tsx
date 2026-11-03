import { useState } from "react";
import {
  BookOutlined,
  DollarCircleOutlined,
  SyncOutlined,
  CreditCardOutlined,
  UsergroupAddOutlined,
  DownOutlined,
  UpOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

export const ReportGlossary = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"kpi" | "status" | "cashflow" | "customers" | "excel">("kpi");

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
            <BookOutlined />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Cẩm Nang Chú Thích Thuật Ngữ &amp; Phương Pháp Đo Lường Chỉ Số
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Hướng dẫn đối soát
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Giải thích tường tận ý nghĩa doanh thu, công thức tính toán và hướng dẫn đọc file Excel đối soát của cửa hàng Urban Stitch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
          <span>{isOpen ? "Thu gọn chú thích" : "Tra cứu chi tiết"}</span>
          {isOpen ? <UpOutlined className="text-[10px]" /> : <DownOutlined className="text-[10px]" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 p-5 bg-slate-50/50 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("kpi")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "kpi"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <DollarCircleOutlined />
              <span>Chỉ số kinh doanh &amp; KPI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "status"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <SyncOutlined />
              <span>Chu trình 8 trạng thái đơn</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cashflow")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "cashflow"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <CreditCardOutlined />
              <span>Dòng tiền &amp; Kênh thanh toán</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("customers")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "customers"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <UsergroupAddOutlined />
              <span>Khách hàng &amp; Sản phẩm</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("excel")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "excel"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <BookOutlined />
              <span>Đối soát File Excel (.xlsx)</span>
            </button>
          </div>

          {activeTab === "kpi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Doanh Thu Thực Thu
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Net Revenue
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Tổng số tiền thực tế hệ thống thu được từ các đơn hàng hoàn tất vận hành giao hàng thành công (trạng thái <strong>Hoàn tất</strong> và <strong>Đã giao hàng</strong>), không nằm trong luồng hoàn tiền. Đơn VNPAY đã thanh toán đang giao được hạch toán vào Dòng tiền đang luân chuyển.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Công thức:</span> ∑ Tiền các đơn giao thành công không bị hủy/hoàn
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Doanh Số Gộp &amp; Hiệu Dụng
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                      Gross / Net Gross
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    <strong>Tổng phát sinh gộp (Gross):</strong> Toàn bộ 100% đơn đặt kể cả đơn hủy.
                    <br />
                    <strong>Doanh số hiệu dụng (Net Gross):</strong> Đã trừ bỏ đơn Hủy và Trả hàng, phản ánh đúng lực cầu thực tế đưa vào vận hành.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Hiệu dụng:</span> Tổng phát sinh gộp - Đơn hủy/hoàn
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Đơn Giá Trung Bình (AOV)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      AOV Chuẩn
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Giá trị trung bình trên mỗi đơn hàng thành công, tuyệt đối không dùng số ước tính thay thế. Nếu chưa có đơn giao thành công nào, AOV bằng 0 ₫.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Công thức:</span> Doanh thu thực thu / Số đơn thành công
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Tỷ Lệ Tăng Trưởng
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      Growth Rate
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    So sánh doanh thu với kỳ trước có cùng độ dài thời gian. Nếu kỳ trước doanh thu bằng 0 ₫ và kỳ này phát sinh doanh thu, hệ thống hiển thị <strong>Mới phát sinh</strong> theo đúng chuẩn toán học.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Quy tắc:</span> (Kỳ này - Kỳ trước) / Kỳ trước × 100%
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Tổng Đơn Hàng &amp; Khách Hàng
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Volume &amp; Users
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Tổng số đơn đặt phát sinh trong kỳ và số lượng khách hàng riêng biệt (khử trùng lặp theo tài khoản hoặc số điện thoại người nhận).
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Ý nghĩa:</span> Thể hiện quy mô và độ phủ khách hàng
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Tỷ Lệ Chốt Thành Công
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Success Rate
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Tỷ lệ phần trăm đơn hoàn tất và đã giao thành công trên tổng số đơn phát sinh. Đơn hủy hoặc khiếu nại hoàn trả được tách riêng ở chỉ số hủy/hoàn.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Công thức:</span> (Số đơn thành công / Tổng đơn) × 100%
                </div>
              </div>
            </div>
          )}

          {activeTab === "excel" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <BookOutlined className="text-blue-600" />
                  <span>Quy Ước Cấu Trúc Dữ Liệu Trong File Excel</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
                    <strong className="text-blue-900 block">Cấu trúc chi tiết: Mỗi dòng = 1 sản phẩm</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-1 leading-relaxed">
                      Để phục vụ đối soát kế toán và phân tích chuyên sâu, file Excel xuất ra chi tiết ở cấp độ món hàng. Đơn hàng có 3 món sẽ có 3 dòng dữ liệu với đầy đủ Đơn giá, Số lượng, Thành tiền món và thông tin đơn hàng đi kèm.
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200">
                    <strong className="text-slate-800 block">Tối ưu cho PivotTable &amp; Hàm Excel</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-1 leading-relaxed">
                      Định dạng bảng phẳng (Flat Tabular Format) không merge ô dữ liệu giữa các đơn, giúp kế toán dễ dàng dùng VLOOKUP, SUMIFS, PivotTable và AutoFilter mà không gặp lỗi.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <CreditCardOutlined className="text-emerald-600" />
                  <span>Cách Sử Dụng Cột "Phân Loại Dòng Tiền"</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <strong className="text-emerald-900 block">Lọc [Dòng tiền an toàn]:</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Đối soát Doanh thu thực thu. Tổng tiền cột "Thực thu đơn" của nhóm này khớp 100% với Doanh thu thực thu trên Dashboard và Reports.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                    <strong className="text-blue-900 block">Lọc [Dòng tiền đang luân chuyển]:</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Theo dõi công nợ COD bưu tá đang thu hộ hoặc tiền VNPAY tạm giữ của các đơn đang đóng gói/vận chuyển.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
                    <strong className="text-rose-900 block">Lọc [Dòng tiền tổn thất]:</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Thống kê giá trị đơn hàng bị hủy hoặc hoàn trả để đối soát nguyên nhân đứt gãy đơn hàng.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "status" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-900">1. Chờ xử lý (Pending)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Đơn hàng vừa được khách đặt qua Web, hệ thống ghi nhận và gửi thông báo, đang chờ nhân viên kiểm duyệt thông tin địa chỉ và hàng hóa trong kho.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-900">2. Đã xác nhận (Confirmed)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Nhân viên hoặc cổng thanh toán tự động xác nhận thông tin đơn hàng hợp lệ, đủ điều kiện để chuyển lệnh xuất kho đóng gói.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-900">3. Đang xử lý (Processing)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Bộ phận kho đang kiểm tra số Serial/IMEI thiết bị Apple, dán tem niêm phong và đóng hộp xốp bảo vệ chống va đập.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-900">4. Đang giao hàng (Shipping)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Kiện hàng đã được xuất kho bàn giao cho bưu tá đơn vị vận chuyển và đang trong lộ trình luân chuyển tới địa chỉ nhận.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-900">5. Đã giao hàng (Delivered)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Bưu tá đã phát thành công kiện hàng tận tay người nhận, đã thu tiền mặt (đơn COD) và cập nhật trạng thái hoàn thành vận chuyển.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">6. Hoàn tất (Completed)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Đơn hàng kết thúc chu trình giao nhận thành công, vượt qua thời gian quy định đổi trả và chính thức ghi nhận vào doanh thu an toàn.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-slate-900">7. Đã hủy (Cancelled)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Đơn hàng bị hủy bỏ trước khi giao do khách hàng đổi ý, đặt nhầm sản phẩm, thông tin liên hệ không chính xác hoặc hết hàng tồn kho.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-xs font-bold text-slate-900">8. Trả hàng / Hoàn tiền (Returned)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-2 leading-relaxed">
                  Kiện hàng bị phát không thành công sau 3 lần giao hoặc khách hàng yêu cầu đổi trả bảo hành sản phẩm theo chính sách Apple Store.
                </p>
              </div>
            </div>
          )}

          {activeTab === "cashflow" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <CheckCircleOutlined className="text-emerald-600" />
                  <span>Phân Loại 3 Dòng Tiền Vận Hành</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <strong className="text-emerald-900 block">Dòng tiền thực thu hoàn tất (Safe Cashflow):</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Gồm các đơn Hoàn tất và Đã giao. Tiền đã vào tài khoản ngân hàng hoặc bưu tá đã thu xong, mang tính thanh khoản cao và an toàn tuyệt đối.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                    <strong className="text-blue-900 block">Dòng tiền đang vận hành (Operating Cashflow):</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Gồm các đơn Chờ xử lý, Đã xác nhận, Đang xử lý và Đang giao hàng. Tiền đang trong quy trình luân chuyển, sẽ chuyển hóa thành thực thu khi giao hoàn tất.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
                    <strong className="text-rose-900 block">Dòng tiền thất thoát (Lost Cashflow):</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Gồm các đơn Đã hủy hoặc Trả hàng hoàn tiền. Doanh số bị sụt giảm do khách từ chối nhận hoặc khiếu nại chất lượng.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <CreditCardOutlined className="text-blue-600" />
                  <span>Kênh Thanh Toán Được Hỗ Trợ</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                    <strong className="text-blue-900 block">Cổng thanh toán điện tử VNPAY:</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Khách hàng thanh toán trực tuyến tức thì thông qua quét mã VNPAY-QR, ứng dụng ngân hàng di động, thẻ ATM nội địa hoặc thẻ quốc tế Visa / MasterCard / JCB.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
                    <strong className="text-amber-900 block">Thanh toán khi nhận hàng (COD - Cash On Delivery):</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5">
                      Khách hàng kiểm tra kiện hàng niêm phong của Apple khi bưu tá giao đến, sau đó mới thanh toán tiền mặt trực tiếp cho nhân viên giao vận.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-100/70 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
                    <InfoCircleOutlined className="text-blue-600 text-xs shrink-0" />
                    <span>Hệ thống chỉ tích hợp duy nhất 2 cổng thanh toán chuẩn: VNPAY và COD.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <UsergroupAddOutlined className="text-indigo-600" />
                  <span>Phân Khúc Khách Hàng</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100">
                    <strong className="text-indigo-900 block">Khách hàng thành viên (Member Customers):</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-1 leading-relaxed">
                      Khách hàng đã đăng ký tài khoản chính thức tại Apple Store, có đầy đủ hồ sơ cá nhân, lịch sử bảo hành thiết bị và được tính điểm thưởng thành viên.
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200">
                    <strong className="text-slate-800 block">Khách hàng vãng lai (Guest Customers):</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-1 leading-relaxed">
                      Khách hàng đặt mua nhanh (Guest Checkout) mà không cần đăng nhập hay khởi tạo tài khoản, hệ thống quản lý qua số điện thoại và địa chỉ giao hàng.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <BookOutlined className="text-amber-600" />
                  <span>Xếp Hạng &amp; Tồn Kho Sản Phẩm</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <strong className="text-emerald-900 block">Top 10 Sản phẩm bán chạy nhất:</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-1 leading-relaxed">
                      Xếp hạng các thiết bị Apple (iPhone, MacBook, iPad...) có số lượng máy bán ra và doanh số đóng góp cao nhất trong khoảng thời gian báo cáo.
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100">
                    <strong className="text-amber-900 block">Top 10 Sản phẩm kén khách (Cần kích cầu):</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-1 leading-relaxed">
                      Liệt kê các thiết bị có số lượng bán thấp trong kỳ nhưng lượng tồn kho tại các chi nhánh còn nhiều, giúp nhà quản lý lên kế hoạch khuyến mãi kích cầu tồn kho.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ReportGlossary;
