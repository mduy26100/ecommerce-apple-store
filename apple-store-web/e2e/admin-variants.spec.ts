import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Biến thể & Tồn kho (Product Variants CRUD)", () => {
  const uniqueId = Date.now();
  const testProductName = `iPhone 16 Pro Test ${uniqueId}`;
  const testProductSlug = `iphone-16-pro-test-${uniqueId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");
  });

  test("Khởi tạo sản phẩm mẫu để phục vụ kiểm thử biến thể", async ({ page }) => {
    await page.click("button:has-text('Thêm sản phẩm')");
    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();

    await page.fill("input#name", testProductName);
    await page.fill("input#slug", testProductSlug);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(page.locator(".ant-table")).toContainText(testProductName);
  });

  test("Mở ngăn kéo quản lý phiên bản và bảng dữ liệu", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Quản lý phiên bản");
    await expect(drawer.locator("button:has-text('Thêm phiên bản')")).toBeVisible();
  });

  test("Thực hiện tạo phiên bản sản phẩm mới thành công", async ({ page }) => {
    const testSku = `IP16P-256-${Date.now()}`;
    const testVariantName = "256GB - Titan Sa Mạc";

    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#sku", testSku);
    await page.fill("input#variantName", testVariantName);
    await page.fill("input#price", "32990000");
    await page.fill("input#quantityInStock", "100");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await expect(drawer.locator(".ant-table")).toContainText(testSku);
  });

  test("Kiểm tra báo lỗi khi thiếu mã SKU", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Lưu')");

    const errorFeedback = page.locator(".ant-form-item-explain-error");
    await expect(errorFeedback.first()).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Hủy')");
    await expect(modal).not.toBeVisible();
  });

  test("Thực hiện chỉnh sửa và xóa phiên bản thành công", async ({ page }) => {
    const testSku = `EDIT-SKU-${Date.now()}`;
    const updatedSku = `${testSku}-UPDATED`;

    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    await page.fill("input#sku", testSku);
    await page.fill("input#price", "25000000");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(drawer.locator(".ant-table")).toContainText(testSku);

    const variantRow = drawer.locator(`.ant-table-row:has-text('${testSku}')`);
    await variantRow.locator("button[title='Chỉnh sửa'], button:has(.anticon-edit)").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#sku", updatedSku);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "PUT"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await expect(drawer.locator(".ant-table")).toContainText(updatedSku);

    const updatedRow = drawer.locator(`.ant-table-row:has-text('${updatedSku}')`);
    await updatedRow.locator("button[title='Xóa'], button:has(.anticon-delete)").click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(drawer.locator(".ant-table")).not.toContainText(updatedSku);
  });
});
