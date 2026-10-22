import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Danh mục (Categories CRUD & Image Cropper)", () => {
  const sampleImagePath = "C:/Users/Admin/Documents/KryzoSoft/images/opengraph-image.png";

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    }
    await page.goto("/admin/categories");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị danh sách danh mục và bảng dữ liệu", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Danh mục/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("button:has-text('Thêm danh mục')")).toBeVisible();
  });

  test("Thực hiện tạo danh mục kèm tải và cắt ảnh 1:1 qua ImageCropperModal thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `iPad Pro ${uniqueSuffix}`;
    const testSlug = `ipad-pro-${uniqueSuffix}`;

    await page.click("button:has-text('Thêm danh mục')");

    const modal = page.locator(".ant-modal").first();
    await expect(modal).toBeVisible();

    await page.fill("input#name", testName);
    await page.fill("input#slug", testSlug);
    await page.fill("input#displayOrder", "1");
    await page.fill("textarea#description", "Dòng máy tính bảng iPad Pro cao cấp");

    const fileInput = page.locator("input#categoryImageUploadInput");
    await fileInput.setInputFiles(sampleImagePath);

    const cropperModal = page.locator(".ant-modal:has-text('Cắt ảnh danh mục')");
    await expect(cropperModal).toBeVisible();

    const confirmCropBtn = cropperModal.locator(".ant-modal-footer button:has-text('Xác nhận')");
    await confirmCropBtn.click();

    await expect(cropperModal).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator(".ant-tag:has-text('Đã cắt ảnh 1:1 sẵn sàng tải lên')")).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "POST" && res.status() < 400,
        { timeout: 30000 }
      ),
      modal.locator(".ant-modal-footer button:has-text('Lưu')").click(),
    ]);

    await expect(modal).not.toBeVisible({ timeout: 10000 });
    await page.fill("input[placeholder*='danh mục']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);
  });

  test("Kiểm tra báo lỗi khi thiếu tên hoặc trùng slug", async ({ page }) => {
    await page.click("button:has-text('Thêm danh mục')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Lưu')");

    const errorFeedback = page.locator(".ant-form-item-explain-error");
    await expect(errorFeedback.first()).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Hủy')");
    await expect(modal).not.toBeVisible();
  });

  test("Thực hiện chỉnh sửa danh mục thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `MacBook ${uniqueSuffix}`;
    const testSlug = `macbook-${uniqueSuffix}`;
    const updatedName = `${testName} Cập nhật`;

    await page.click("button:has-text('Thêm danh mục')");
    await page.fill("input#name", testName);
    await page.fill("input#slug", testSlug);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "POST",
        { timeout: 30000 }
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await page.fill("input[placeholder*='danh mục']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.locator("button[title='Chỉnh sửa'], button:has(.anticon-edit)").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", updatedName);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "PUT",
        { timeout: 30000 }
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='danh mục']", updatedName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(updatedName);
  });

  test("Thực hiện xóa danh mục thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `DeleteCat_${uniqueSuffix}`;
    const testSlug = `delete-cat-${uniqueSuffix}`;

    await page.click("button:has-text('Thêm danh mục')");
    await page.fill("input#name", testName);
    await page.fill("input#slug", testSlug);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "POST",
        { timeout: 30000 }
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await page.fill("input[placeholder*='danh mục']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.locator("button[title='Xóa'], button:has(.anticon-delete)").click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "DELETE",
        { timeout: 30000 }
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await page.waitForResponse(
      (res) => res.url().includes("/api/manager/categories") && res.request().method() === "GET"
    );
    await expect(page.locator(`.ant-table-row:has-text('${testName}')`)).not.toBeVisible();
  });
});
