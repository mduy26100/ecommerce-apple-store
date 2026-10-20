import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Tùy chọn Dung lượng (StorageOptions CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/storage-options");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị danh sách dung lượng và bảng dữ liệu", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Dung lượng/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("button:has-text('Thêm dung lượng')")).toBeVisible();
  });

  test("Thực hiện thêm mới tùy chọn dung lượng thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `512GB_${uniqueSuffix}`;

    await page.click("button:has-text('Thêm dung lượng')");

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", testName);
    await page.fill("input#capacityValue", "512");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/storage-options") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='đơn vị']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);
  });

  test("Kiểm tra báo lỗi khi thiếu trường bắt buộc", async ({ page }) => {
    await page.click("button:has-text('Thêm dung lượng')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Lưu')");

    const errorFeedback = page.locator(".ant-form-item-explain-error");
    await expect(errorFeedback.first()).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Hủy')");
    await expect(modal).not.toBeVisible();
  });

  test("Thực hiện chỉnh sửa tùy chọn dung lượng thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `1TB_${uniqueSuffix}`;
    const updatedName = `${testName}_Updated`;

    await page.click("button:has-text('Thêm dung lượng')");
    await page.fill("input#name", testName);
    await page.fill("input#capacityValue", "1024");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/storage-options") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await page.fill("input[placeholder*='đơn vị']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.locator("button[title='Chỉnh sửa'], button:has(.anticon-edit)").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", updatedName);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/storage-options") && res.request().method() === "PUT"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='đơn vị']", updatedName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(updatedName);
  });

  test("Thực hiện xóa tùy chọn dung lượng thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `DelStorage_${uniqueSuffix}`;

    await page.click("button:has-text('Thêm dung lượng')");
    await page.fill("input#name", testName);
    await page.fill("input#capacityValue", "128");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/storage-options") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await page.fill("input[placeholder*='đơn vị']", testName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testName);

    const row = page.locator(`.ant-table-row:has-text('${testName}')`);
    await row.locator("button[title='Xóa'], button:has(.anticon-delete)").click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/storage-options") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(page.locator(".ant-table")).not.toContainText(testName);
  });
});
