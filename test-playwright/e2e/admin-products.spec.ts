import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Sản phẩm (Products CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    }
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị danh sách sản phẩm và bảng dữ liệu", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Sản phẩm/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("button:has-text('Thêm sản phẩm')")).toBeVisible();
  });

  test("Thực hiện tạo sản phẩm mới thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `iPhone 16 Pro Max ${uniqueSuffix}`;
    const testSlug = `iphone-16-pro-max-${uniqueSuffix}`;

    await page.click("button:has-text('Thêm sản phẩm')");

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    const option = page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first();
    await option.click();

    await page.fill("input#name", testName);
    await page.fill("input#slug", testSlug);
    await page.fill("input#modelCode", "A3106");
    await page.fill("input#warrantyMonths", "12");
    await page.fill("textarea#shortDescription", "Điện thoại Apple cao cấp nhất");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='Tìm theo tên']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);
  });

  test("Kiểm tra báo lỗi khi thiếu thông tin bắt buộc", async ({ page }) => {
    await page.click("button:has-text('Thêm sản phẩm')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Lưu')");

    const errorFeedback = page.locator(".ant-form-item-explain-error");
    await expect(errorFeedback.first()).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Hủy')");
    await expect(modal).not.toBeVisible();
  });

  test("Thực hiện chỉnh sửa sản phẩm thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `MacBook Pro ${uniqueSuffix}`;
    const testSlug = `macbook-pro-${uniqueSuffix}`;
    const updatedName = `${testName} M3 Max`;

    await page.click("button:has-text('Thêm sản phẩm')");

    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();

    await page.fill("input#name", testName);
    await page.fill("input#slug", testSlug);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(page.locator(".ant-modal")).not.toBeVisible();

    await page.fill("input[placeholder*='Tìm theo tên']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await drawer.locator("button:has-text('Sửa sản phẩm')").click();

    const editModal = page.locator(".ant-modal");
    await expect(editModal).toBeVisible();

    await page.fill("input#name", updatedName);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "PUT"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(editModal).not.toBeVisible();
    await drawer.locator("button.ant-drawer-close, .ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
    await page.fill("input[placeholder*='Tìm theo tên']", updatedName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table").first()).toContainText(updatedName);
  });

  test("Thực hiện xóa sản phẩm thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `DeleteProduct_${uniqueSuffix}`;
    const testSlug = `delete-product-${uniqueSuffix}`;

    await page.click("button:has-text('Thêm sản phẩm')");

    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();

    await page.fill("input#name", testName);
    await page.fill("input#slug", testSlug);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await page.fill("input[placeholder*='Tìm theo tên']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.locator("button[title='Xóa'], button:has(.anticon-delete)").click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(page.locator(".ant-table")).not.toContainText(testName);
  });
});
