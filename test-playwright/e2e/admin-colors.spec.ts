import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Màu sắc (Colors CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    }
    await page.goto("/admin/colors");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị danh sách màu sắc và bảng dữ liệu", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Màu sắc/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("button:has-text('Thêm màu sắc')")).toBeVisible();
  });

  test("Thực hiện thêm mới màu sắc thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `Titan Sa Mạc ${uniqueSuffix}`;
    const testCode = `TITAN_DESERT_${uniqueSuffix}`;
    const testHex = "#C4A482";

    await page.click("button:has-text('Thêm màu sắc')");

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", testName);
    await page.fill("input#code", testCode);
    await page.fill("input#hexCode", testHex);

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/colors") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='màu']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);
  });

  test("Kiểm tra báo lỗi khi nhập trùng mã Code hoặc thiếu trường bắt buộc", async ({ page }) => {
    await page.click("button:has-text('Thêm màu sắc')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Lưu')");

    const errorFeedback = page.locator(".ant-form-item-explain-error");
    await expect(errorFeedback.first()).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Hủy')");
    await expect(modal).not.toBeVisible();
  });

  test("Thực hiện chỉnh sửa màu sắc thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `Xanh Titan ${uniqueSuffix}`;
    const testCode = `TITAN_BLUE_${uniqueSuffix}`;
    const testHex = "#4A5568";
    const updatedName = `${testName} Cập nhật`;

    await page.click("button:has-text('Thêm màu sắc')");
    await page.fill("input#name", testName);
    await page.fill("input#code", testCode);
    await page.fill("input#hexCode", testHex);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/colors") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await page.fill("input[placeholder*='màu']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.locator("button[title='Chỉnh sửa'], button:has(.anticon-edit)").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", updatedName);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/colors") && res.request().method() === "PUT"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='màu']", updatedName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(updatedName);
  });

  test("Thực hiện xóa màu sắc thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `DeleteColor_${uniqueSuffix}`;
    const testCode = `DEL_COLOR_${uniqueSuffix}`;
    const testHex = "#000000";

    await page.click("button:has-text('Thêm màu sắc')");
    await page.fill("input#name", testName);
    await page.fill("input#code", testCode);
    await page.fill("input#hexCode", testHex);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/colors") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await page.fill("input[placeholder*='màu']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.locator("button[title='Xóa'], button:has(.anticon-delete)").click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/colors") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(page.locator(".ant-table")).not.toContainText(testName);
  });
});
