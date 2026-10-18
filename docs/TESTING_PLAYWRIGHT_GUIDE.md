# HƯỚNG DẪN KIỂM THỬ PLAYWRIGHT HEADLESS & TIẾT KIỆM QUOTA (Testing Playwright Guide)

Tài liệu này là quy chuẩn bắt buộc tuyệt đối về việc chạy và kiểm thử tự động hệ thống Frontend & Backend của dự án **ecommerce-apple-store**. Mọi AI Agent và kỹ sư đều phải tuân thủ nghiêm ngặt 100% để đảm bảo chất lượng phần mềm mà không gây hao tốn tài nguyên token/quota.

---

## 1. Bản Tuyên Ngôn Tiết Kiệm Quota

> ### === QUY ĐỊNH BẮT BUỘC ĐỂ TIẾT KIỆM QUOTA ===
> 1. **TUYỆT ĐỐI KHÔNG** mở trình duyệt GUI (No Browser Window), **KHÔNG** dùng công cụ Computer Use/chụp ảnh màn hình (No screenshots).
> 2. Kiểm thử Web UI 100% bằng script Playwright chạy ngầm ở chế độ **HEADLESS (`headless: true`)** thông qua Terminal.
> 3. Thao tác và kiểm tra hoàn toàn qua **DOM/Selector** (click, fill, expect text, HTTP response).
>
> ### QUY TRÌNH THỰC HIỆN:
> - Tự tạo file kịch bản (ví dụ: `e2e/admin-categories.spec.ts`) và chạy ngầm: `npx playwright test e2e/admin-categories.spec.ts`
> - Nếu phát hiện bug (DOM selector sai, logic lỗi, API 500): Tự đọc log terminal, mở code tương ứng để sửa, sau đó chạy lại test.
> - Khi toàn bộ kịch bản báo **PASS**: Dừng lại và tóm tắt kết quả kiểm thử.

---

## 2. Chính Sách Thao Tác Dữ Liệu Thực Tế trong Database (Real Database Mutation Policy)

> [!TIP]
> **DỰ ÁN MÔI TRƯỜNG TEST - TOÀN QUYỀN THÊM / SỬA / XÓA DỮ LIỆU THẬT:**
> - Đây là dự án phục vụ môi trường kiểm thử và phát triển nội bộ (`AppleStoreDb`). Do đó, **cho phép AI Agent và các kịch bản kiểm thử Playwright tự do Thêm, Sửa, Xóa dữ liệu trực tiếp trong Database** thông qua giao diện hoặc gọi API.
> - **Tuyệt đối KHÔNG sợ làm bẩn database:** Không cần phải viết các hàm rollback phức tạp hoặc mock dữ liệu ảo. Việc thao tác dữ liệu sống (live data) giúp phản ánh chính xác nhất tính toàn vẹn của Clean Architecture, Entity Framework Core và các ràng buộc Foreign Key/Unique Index trong SQL Server.
> - **Khuyến khích tạo dữ liệu sản phẩm Apple thực tế:** Khi viết test, hãy chủ động nhập các dữ liệu sát với thực tế thị trường (ví dụ: Danh mục *iPhone*, Màu *Titan Tự Nhiên*, Dung lượng *256GB*, Sản phẩm *iPhone 16 Pro*, Giá *28.990.000 đ*, Tồn kho *50*). Dữ liệu này sẽ được giữ lại làm dữ liệu mẫu (Seed Data) trực quan cho cả phân hệ Admin và Storefront.
> - **Kiểm thử tính năng Xóa (Delete):** Có thể tạo dữ liệu mới rồi thực hiện xóa trực tiếp trên chính dữ liệu đó để xác nhận luồng xóa hoạt động trơn tru.

---

## 3. Thiết Lập Môi Trường Kiểm Thử Playwright

Thư viện kiểm thử Playwright được cấu hình trực tiếp tại thư mục `apple-store-web/`:

### 2.1. Cài đặt Dependencies (nếu chưa có)
```bash
cd apple-store-web
npm install -D @playwright/test
npx playwright install chromium
```

### 2.2. File Cấu Hình Chuẩn `playwright.config.ts`
Được đặt tại `apple-store-web/playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results.json" }]],
  use: {
    baseURL: "http://localhost:5173",
    headless: true, // BẮT BUỘC HEADLESS 100%
    trace: "off",
    screenshot: "off", // CẤM CHỤP ẢNH MÀN HÌNH ĐỂ TRÁNH TỐN TOKEN
    video: "off",      // CẤM GHI HÌNH ĐỂ TRÁNH TỐN TÀI NGUYÊN
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: "chromium-headless",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

## 4. Khởi Chạy Dịch Vụ Phục Vụ Kiểm Thử

Trước khi chạy bất kỳ kịch bản Playwright nào, 2 dịch vụ BE và FE cần phải đang hoạt động:

### 3.1. Khởi chạy Backend (.NET API)
Từ thư mục gốc dự án:
```powershell
dotnet run --project apple-store-app/src/Host/Host.csproj --urls "http://localhost:5044"
```
Kiểm tra sức khỏe Backend: `curl http://localhost:5044/swagger` hoặc gọi `GET http://localhost:5044/api/manager/categories`.

### 3.2. Khởi chạy Frontend (Vite React)
Từ thư mục `apple-store-web`:
```powershell
npm run dev -- --port 5173
```
Frontend sẵn sàng tại `http://localhost:5173`.

---

## 5. Cấu Trúc Thư Mục & Kịch Bản E2E

Toàn bộ các file kiểm thử được đặt trong thư mục:
```text
apple-store-web/e2e/
├── admin-categories.spec.ts         # Kiểm thử CRUD Danh mục
├── admin-colors.spec.ts             # Kiểm thử CRUD Màu sắc
├── admin-storage-options.spec.ts    # Kiểm thử CRUD Dung lượng
├── admin-products.spec.ts           # Kiểm thử CRUD Sản phẩm
├── admin-variants.spec.ts           # Kiểm thử CRUD Biến thể & Kho
├── admin-variant-images.spec.ts     # Kiểm thử Quản lý Ảnh biến thể
├── admin-specifications.spec.ts     # Kiểm thử CRUD Thông số kỹ thuật
├── admin-orders.spec.ts             # Kiểm thử Xem đơn & Cập nhật trạng thái
└── admin-full-regression.spec.ts    # Kịch bản kiểm thử toàn diện cuối cùng
```

---

## 6. Mẫu Kịch Bản Kiểm Thử Headless Chuẩn (E2E Test Template)

Dưới đây là khuôn mẫu kịch bản chuẩn cho một tính năng Admin (ví dụ: `admin-colors.spec.ts`):

```typescript
import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Màu sắc (Colors CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng trực tiếp đến trang quản trị màu sắc
    await page.goto("/admin/colors");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị danh sách màu sắc và bảng dữ liệu", async ({ page }) => {
    // 1. Kiểm tra tiêu đề trang
    await expect(page.locator("h1, h2, .ant-page-header-heading-title")).toContainText(/Màu sắc/i);

    // 2. Kiểm tra bảng Ant Design xuất hiện
    const table = page.locator(".ant-table");
    await expect(table).toBeVisible();

    // 3. Kiểm tra nút Thêm mới
    const addButton = page.locator("button:has-text('Thêm màu sắc'), button:has-text('Thêm mới')");
    await expect(addButton).toBeVisible();
  });

  test("Thực hiện thêm mới màu sắc thành công", async ({ page }) => {
    const testCode = `TEST_CLR_${Date.now()}`;
    const testName = `Màu Test ${Date.now()}`;

    // 1. Click nút thêm mới
    await page.click("button:has-text('Thêm màu sắc'), button:has-text('Thêm mới')");

    // 2. Chờ Modal hoặc Drawer mở ra
    const modal = page.locator(".ant-modal, .ant-drawer");
    await expect(modal).toBeVisible();

    // 3. Điền thông tin form
    await page.fill("input#name, input[name='name']", testName);
    await page.fill("input#code, input[name='code']", testCode);
    await page.fill("input#hexCode, input[name='hexCode']", "#FF5733");

    // 4. Bắt request API POST khi submit
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/colors") && res.request().method() === "POST"),
      page.click(".ant-modal-footer button[type='submit'], .ant-modal button:has-text('Lưu'), .ant-modal button:has-text('Tạo')"),
    ]);

    // 5. Xác nhận HTTP Status 200/201
    expect(response.status()).toBeLessThan(400);

    // 6. Modal phải đóng lại và dòng dữ liệu mới xuất hiện trên bảng
    await expect(modal).not.toBeVisible();
    await expect(page.locator(".ant-table")).toContainText(testName);
  });

  test("Kiểm tra báo lỗi khi nhập trùng mã Code hoặc thiếu trường bắt buộc", async ({ page }) => {
    await page.click("button:has-text('Thêm màu sắc'), button:has-text('Thêm mới')");
    const modal = page.locator(".ant-modal, .ant-drawer");
    await expect(modal).toBeVisible();

    // Bấm Submit ngay khi chưa nhập gì
    await page.click(".ant-modal-footer button[type='submit'], .ant-modal button:has-text('Lưu'), .ant-modal button:has-text('Tạo')");

    // Phải xuất hiện thông báo lỗi validate của Antd/Zod
    const errorFeedback = page.locator(".ant-form-item-explain-error");
    await expect(errorFeedback.first()).toBeVisible();
  });
});
```

---

## 7. Lệnh Chạy Kịch Bản Kiểm Thử trong Terminal

### Chạy một kịch bản đơn lẻ (Headless)
```bash
cd apple-store-web
npx playwright test e2e/admin-colors.spec.ts --reporter=list
```

### Chạy toàn bộ các kịch bản kiểm thử (Regression)
```bash
cd apple-store-web
npx playwright test --reporter=list
```

---

## 8. Quy Trình Xử Lý Khi Gặp Lỗi (Bug-Fixing Loop)

```
       [ Chạy Playwright Headless trong Terminal ]
                           │
                 Có kịch bản BỊ FAIL?
                ┌──────────┴──────────┐
               YES                    NO
                │                      │
   [ Đọc Log Terminal ]                [ Xác nhận PASS ]
   - Xem mã HTTP lỗi (400, 404, 500)   [ Tóm tắt kết quả ]
   - Xem Selector nào bị timeout       [ Commit & Push ]
   - Xem thông điệp Assert fail        [ Tick Todo list ]
                │
   [ Mở file mã nguồn sửa lỗi ]
   - Sửa BE nếu lỗi API/Database
   - Sửa FE nếu lỗi DOM/Form/Hook
                │
   [ Chạy Lại Kịch Bản Headless ] ───┘ (Lặp lại cho đến khi PASS)
```

### Nguyên tắc xử lý lỗi nhanh:
1. **Nếu lỗi `Timeout 10000ms waiting for locator(...)`:**
   - Kiểm tra selector có khớp với Ant Design không (`.ant-table-row`, `.ant-btn`, `.ant-input`).
   - Kiểm tra API gọi dữ liệu đã xong chưa (`await page.waitForLoadState('networkidle')`).
2. **Nếu lỗi API trả về `409 Conflict` hoặc `400 Bad Request`:**
   - Dữ liệu test bị trùng lặp `Slug` hoặc `Code` $\rightarrow$ Sử dụng timestamp suffix như `Date.now()`.
   - Kiểm tra logic kiểm tra trùng lặp trong Service layer của Backend.
3. **Nếu lỗi `500 Internal Server Error`:**
   - Đọc console log của cửa sổ Terminal chạy `dotnet run`.
   - Kiểm tra xem Exception nào chưa được xử lý hoặc mapping database cấu hình thiếu.
