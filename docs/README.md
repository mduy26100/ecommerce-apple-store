# TRUNG TÂM ĐIỀU PHỐI VẬN HÀNH DỰ ÁN (Project Master Playbook)

> **DÀNH CHO AI AGENT & LẬP TRÌNH VIÊN TỰ HÀNH:**
> File này là **điểm nhập cuộc duy nhất (Single Source of Truth & Entrypoint)**. Khi bạn (hoặc bất kỳ AI nào) nhận nhiệm vụ phát triển dự án này, chỉ cần đọc toàn bộ file `docs/README.md` là có thể tự động triển khai mã nguồn, kiểm thử và bàn giao tính năng từ A đến Z mà không cần hỏi lại người dùng!

---

## 1. Tổng Quan Dự Án & Phạm Vi Triển Khai

- **Tên dự án:** `ecommerce-apple-store`
- **Mục tiêu giai đoạn hiện tại:** Triển khai hoàn thiện **Phân hệ Quản trị (Admin Portal)** phục vụ quản lý danh mục, màu sắc, dung lượng, dòng sản phẩm, cấu hình biến thể (SKU, giá, kho), ảnh biến thể, thông số kỹ thuật và đơn hàng.
- **Lưu ý về Xác thực (Auth):** Tạm thời chưa yêu cầu chặn Auth/Login trong giai đoạn này để tối ưu tốc độ hoàn thiện và kiểm thử các tính năng lõi (các attribute `[Authorize]` trên controller sẽ được kích hoạt sau chỉ bằng một dòng code).

### Ngăn xếp Công nghệ (Tech Stack):
- **Backend (`apple-store-app`):**
  - .NET 8 Web API, Clean Architecture (Domain $\leftarrow$ Application $\leftarrow$ Infrastructure $\leftarrow$ Host).
  - Entity Framework Core, SQL Server, Ardalis.Specification, Unit of Work & Generic Repository.
  - Tự động bọc chuẩn `ApiResponse<T>`, phân trang qua `PagedRequest` và `PagedList<T>`.
- **Frontend (`apple-store-web`):**
  - React 19, Vite 8, TypeScript, Ant Design 6, Tailwind CSS v4.
  - TanStack React Query 5 (Server State Cache & Invalidation), React Router 7.
  - Zod & React Hook Form, Axios với Interceptors chuẩn hóa.

---

## 2. Bản Đồ Tài Liệu Trong Thư Mục `./docs/`

Mọi tài liệu chuyên sâu được phân bổ có tổ chức trong thư mục này:

| Tên File | Vai trò & Nội dung cốt lõi |
| :--- | :--- |
| [README.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/README.md) | **Tài liệu chủ đạo (Master Playbook)** điều phối toàn bộ chu trình tự động. |
| [ADMIN_ROADMAP_TODO.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/ADMIN_ROADMAP_TODO.md) | **Bảng tiến độ & Checklist Todo**: Danh sách từng công việc từ Giai đoạn 0 đến 9 có checkbox `[ ]` / `[x]`. |
| [ADMIN_SPECIFICATIONS.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/ADMIN_SPECIFICATIONS.md) | **Đặc tả kỹ thuật & Nghiệp vụ**: Chi tiết 11 bảng, quy tắc nghiệp vụ, API payload, thiết kế UI. |
| [TESTING_PLAYWRIGHT_GUIDE.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/TESTING_PLAYWRIGHT_GUIDE.md) | **Quy chuẩn kiểm thử Playwright Headless**: Quy định cấm GUI/Screenshot, hướng dẫn chạy test ngầm, mẫu test. |
| [GIT_WORKFLOW.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/GIT_WORKFLOW.md) | **Quy chuẩn Git & Commit**: Chuẩn conventional commits không scope, body tiếng Anh, quy trình auto push. |
| [RuleBE.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/RuleBE.md) | **Quy chuẩn Backend**: Cấm comment, block-scoped namespace, GlobalUsings, DTOs, Specs, Services. |
| [RuleFE.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/RuleFE.md) | **Quy chuẩn Frontend**: Cấm comment, 100% tiếng Việt trên UI, cấu trúc Feature-based, Hooks, Components. |

---

## 3. Các Quy Định Bắt Buộc "Sống Còn" (Non-Negotiable Rules)

### 3.1. Tuyệt đối KHÔNG viết Comment vào mã nguồn
- Áp dụng cho cả Backend (`.cs`) và Frontend (`.ts`, `.tsx`).
- Không dùng `//`, `/* */`, `/// <summary>`. Mã nguồn phải tự giải thích bằng việc đặt tên phương thức, biến tường minh, tách hàm nhỏ gọn.

### 3.2. 100% Giao diện người dùng (UI) là Tiếng Việt chuẩn mực
- Tất cả nhãn, tiêu đề, nút bấm, placeholder, thông báo thành công / thất bại, validate form trên giao diện Admin đều phải bằng **Tiếng Việt**.
- Sử dụng thuật ngữ thương mại điện tử chuẩn: *Đơn giá, Tồn kho, Mã SKU, Thông số kỹ thuật, Giá so sánh, Đặt làm ảnh chính, Đã giao hàng*.

### 3.3. Quy định Bắt buộc để Tiết kiệm Quota (Playwright Headless Only)
> 1. **TUYỆT ĐỐI KHÔNG** mở trình duyệt GUI (No Browser Window), **KHÔNG** dùng công cụ chụp ảnh màn hình (No screenshots).
> 2. Kiểm thử Web UI 100% bằng script Playwright chạy ngầm ở chế độ **HEADLESS (`headless: true`)** qua Terminal.
> 3. Thao tác và kiểm tra hoàn toàn qua **DOM/Selector** (click, fill, expect text, HTTP response).
> 4. Quy trình: Chạy script test ngầm $\rightarrow$ Đọc log terminal nếu có lỗi $\rightarrow$ Mở code sửa $\rightarrow$ Chạy lại đến khi PASS.

### 3.4. Quy chuẩn Commit & Auto Push
- Định dạng: `<type>: <summary>` (chữ thường tiếng Anh, không scope).
- Thân commit: Cách 1 dòng trống, gồm các gạch đầu dòng `- ` chi tiết bằng tiếng Anh.
- Tự động push lên nhánh chính (`git push origin main`) sau khi test PASS.

---

## 4. Chu Trình Thực Thi Tự Động 8 Bước Của AI (The Autonomous Agent Loop)

Mỗi khi bắt đầu hoặc tiếp tục một phiên làm việc, AI Agent hãy thực hiện tuần tự vòng lặp sau:

```
[BƯỚC 1] ──> Đọc docs/ADMIN_ROADMAP_TODO.md để tìm mục [ ] đầu tiên chưa hoàn thành.
    │
[BƯỚC 2] ──> Mở docs/ADMIN_SPECIFICATIONS.md xem đặc tả dữ liệu, API, UI của tính năng đó.
    │
[BƯỚC 3] ──> Triển khai Backend (.NET Clean Architecture) theo đúng docs/RuleBE.md:
    │        - DTOs, Specifications, Service, DI, Manager & Public Controllers.
    │
[BƯỚC 4] ──> Triển khai Frontend (React 19) theo đúng docs/RuleFE.md:
    │        - Types, API Client, React Query Hooks, Components, Page, Menu Sidebar.
    │
[BƯỚC 5] ──> Viết kịch bản Playwright và chạy ngầm HEADLESS qua Terminal:
    │        - Chạy: npx playwright test e2e/<feature>.spec.ts
    │        - Nếu FAIL: Đọc log console, sửa code BE/FE, chạy lại cho đến khi PASS 100%.
    │
[BƯỚC 6] ──> Thực hiện Git Commit & Push theo chuẩn docs/GIT_WORKFLOW.md:
    │        - git add .
    │        - git commit -m "feat: ..." -m "- ..."
    │        - git push origin main
    │
[BƯỚC 7] ──> Mở docs/ADMIN_ROADMAP_TODO.md, đánh dấu [x] vào mục vừa hoàn thành.
    │
[BƯỚC 8] ──> Chuyển sang mục [ ] kế tiếp! Lặp lại cho đến Giai đoạn 9 (Kiểm thử hồi quy toàn diện).
```

---

## 5. Hướng Dẫn Khởi Động Nhanh Môi Trường Local (Local Quick Start)

### 5.1. Khởi chạy Backend (.NET 8)
Từ thư mục gốc:
```powershell
dotnet run --project apple-store-app/src/Host/Host.csproj --urls "http://localhost:5044"
```
Backend sẽ lắng nghe tại `http://localhost:5044`. Swagger API UI tại `http://localhost:5044/swagger`.

### 5.2. Khởi chạy Frontend (Vite)
Từ thư mục `apple-store-web/`:
```powershell
npm run dev -- --port 5173
```
Frontend sẵn sàng tại `http://localhost:5173`. Cổng quản trị tại `http://localhost:5173/admin`.

### 5.3. Chạy Kiểm thử Playwright Headless
Từ thư mục `apple-store-web/`:
```powershell
# Chạy một kịch bản đơn lẻ ngầm
npx playwright test e2e/admin-categories.spec.ts --reporter=list

# Chạy toàn bộ bộ kiểm thử ngầm
npx playwright test --reporter=list
```
Sau khi toàn bộ kịch bản báo xanh (PASS), bạn hoàn toàn yên tâm về tính đúng đắn của toàn hệ thống!
