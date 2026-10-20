import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Danh mục (Categories CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/categories");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị danh sách danh mục và bảng dữ liệu", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Danh mục/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("button:has-text('Thêm danh mục')")).toBeVisible();
  });

  test("Thực hiện tạo danh mục sản phẩm mới thành công", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const testName = `iPhone ${uniqueSuffix}`;
    const testSlug = `iphone-${uniqueSuffix}`;

    await page.click("button:has-text('Thêm danh mục')");

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", testName);
    await page.fill("input#slug", testSlug);
    await page.fill("input#displayOrder", "1");
    await page.fill("textarea#description", "Dòng điện thoại iPhone cao cấp");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
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
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "POST"
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
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "PUT"
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
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "POST"
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
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(page.locator(".ant-table")).not.toContainText(testName);
  });
});
