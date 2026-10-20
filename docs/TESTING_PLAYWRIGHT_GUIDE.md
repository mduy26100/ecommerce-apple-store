# HƯỚNG DẪN KIỂM THỬ PLAYWRIGHT HEADLESS & TIẾT KIỆM QUOTA (Testing Playwright Guide)

Tài liệu này là quy chuẩn bắt buộc tuyệt đối về việc chạy và kiểm thử tự động hệ thống Frontend & Backend của dự án **ecommerce-apple-store**. Mọi AI Agent và kỹ sư đều phải tuân thủ nghiêm ngặt 100% để đảm bảo chất lượng mà không gây hao tốn tài nguyên và hạn mức (quota).

---

## 1. Nguyên Tắc Cốt Lõi: Chỉ Kiểm Thử Đúng Phạm Vi Yêu Cầu

> [!CAUTION]
> ### QUY TẮC BẮT BUỘC ĐỂ TIẾT KIỆM QUOTA & THỜI GIAN
> 1. **CHỈ KIỂM THỬ KHI ĐƯỢC YÊU CẦU HOẶC ĐÚNG PHẠM VI:**
>    - Chỉ chạy kiểm thử Playwright khi người dùng yêu cầu trực tiếp, HOẶC chỉ kiểm thử duy nhất tính năng vừa mới phát triển/chỉnh sửa.
>    - **TUYỆT ĐỐI CẤM** chạy toàn bộ test suite (`npx playwright test`), cấm chạy kiểm thử hồi quy hàng loạt (regression), cấm chạy lan man qua các tính năng không liên quan.
> 2. **CHỈ ĐỊNH ĐÍCH DANH FILE TEST CẦN CHẠY:**
>    - Luôn luôn chỉ định rõ ràng đường dẫn file test cụ thể, ví dụ:
>      ```bash
>      npx playwright test e2e/admin-categories.spec.ts --reporter=list
>      ```
>    - **LƯU Ý:** File `playwright.config.ts` đã được cài đặt **CƠ CHẾ CHẶN CỨNG (HARD BLOCK)**. Nếu chạy lệnh `npx playwright test` mà không kèm tên file test cụ thể, hệ thống sẽ **NGAY LẬP TỨC NÉM RA LỖI VÀ CHẶN THỰC THI** để ngăn chặn hoàn toàn việc chạy toàn bộ kịch bản.
> 3. **100% HEADLESS - KHÔNG CHỤP ẢNH / KHÔNG QUAY VIDEO:**
>    - Tuyệt đối không mở trình duyệt GUI, không chụp ảnh màn hình (`screenshot: "off"`), không quay video màn hình (`video: "off"`).
>    - Thao tác và kiểm tra hoàn toàn qua DOM/Selector và phản hồi API trong terminal.

---

## 2. Thao Tác Dữ Liệu Thực Tế trong Database

> [!TIP]
> - Đây là dự án môi trường nội bộ (`AppleStoreDb`), **cho phép tự do Thêm, Sửa, Xóa dữ liệu thật** trong Database qua UI hoặc API.
> - Không cần viết mock ảo hay rollback phức tạp. Dữ liệu tạo mới với thông tin sát thực tế (iPhone, MacBook, v.v.) sẽ trở thành dữ liệu mẫu trực quan.
> - Khi kiểm thử xóa (Delete), hãy tạo mới một bản ghi tạm rồi thực hiện xóa ngay bản ghi đó.

---

## 3. Quy Trình Chạy Kiểm Thử Đơn Tính Năng

### Bước 1: Đảm bảo 2 dịch vụ đang chạy
- **Backend (.NET API)**: Chạy tại cổng `http://localhost:5044`
  ```powershell
  dotnet run --project apple-store-app/src/Host/Host.csproj --urls "http://localhost:5044"
  ```
- **Frontend (Vite React)**: Chạy tại cổng `http://localhost:5173`
  ```powershell
  cd apple-store-web
  npm run dev
  ```

### Bước 2: Chạy DUY NHẤT file test liên quan
Tại thư mục `apple-store-web`, chỉ chạy file test đại diện cho module đang làm việc:
```bash
npx playwright test e2e/<ten-kich-ban>.spec.ts --reporter=list
```
*(Ví dụ: `npx playwright test e2e/admin-products.spec.ts --reporter=list`)*

### Bước 3: Đọc log và xử lý lỗi (nếu có)
- **Nếu FAIL:** Đọc log lỗi trong terminal (mã HTTP lỗi 400/409/500, selector timeout), mở đúng file mã nguồn BE hoặc FE để sửa, sau đó chạy lại duy nhất file test đó.
- **Nếu PASS:** Dừng kiểm thử ngay lập tức và báo cáo tóm tắt kết quả cho người dùng. Không tự ý chạy thêm bất kỳ file test nào khác.
