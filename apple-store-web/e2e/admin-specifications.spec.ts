import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Thông số kỹ thuật sản phẩm (Product Specifications)", () => {
  const uniqueId = Date.now();
  const testProductName = `iPhone 16 Specs Test ${uniqueId}`;
  const testProductSlug = `iphone-16-specs-test-${uniqueId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");
  });

  test("Khởi tạo sản phẩm mẫu để phục vụ kiểm thử thông số kỹ thuật", async ({ page }) => {
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

  test("Mở ngăn kéo quản lý thông số kỹ thuật", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[aria-label='Quản lý thông số'], button:has(.anticon-sliders)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Thông số kỹ thuật");
    await expect(drawer.locator("button:has-text('Thêm thông số')")).toBeVisible();
  });

  test("Thực hiện thêm mới thông số kỹ thuật thành công", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[aria-label='Quản lý thông số'], button:has(.anticon-sliders)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator("button:has-text('Thêm thông số')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Thêm thông số kỹ thuật mới");

    await modal.locator("input#groupName").fill("Màn hình");
    await modal.locator("input#name").fill("Kích thước màn hình");
    await modal.locator("textarea#value").fill("6.3 inch Super Retina XDR");
    await modal.locator("input#displayOrder").fill("1");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-specifications") && res.request().method() === "POST"
      ),
      modal.locator(".ant-modal-footer button:has-text('Thêm mới')").click(),
    ]);

    await expect(drawer.locator(".ant-table")).toContainText("Màn hình");
    await expect(drawer.locator(".ant-table")).toContainText("Kích thước màn hình");
    await expect(drawer.locator(".ant-table")).toContainText("6.3 inch Super Retina XDR");
  });

  test("Chỉnh sửa thông số kỹ thuật thành công", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[aria-label='Quản lý thông số'], button:has(.anticon-sliders)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    const specRow = drawer.locator(".ant-table-row:has-text('Kích thước màn hình')");
    await specRow.locator("button[aria-label='Sửa thông số'], button:has(.anticon-edit)").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Chỉnh sửa thông số kỹ thuật");

    await modal.locator("textarea#value").fill("6.3 inch 120Hz ProMotion");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-specifications") && res.request().method() === "PUT"
      ),
      modal.locator(".ant-modal-footer button:has-text('Cập nhật')").click(),
    ]);

    await expect(drawer.locator(".ant-table")).toContainText("6.3 inch 120Hz ProMotion");
  });

  test("Xóa thông số kỹ thuật thành công", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[aria-label='Quản lý thông số'], button:has(.anticon-sliders)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    const specRow = drawer.locator(".ant-table-row:has-text('Kích thước màn hình')");
    await specRow.locator("button[aria-label='Xóa thông số'], button:has(.anticon-delete)").click();

    await page.waitForSelector(".ant-popconfirm:not(.ant-popconfirm-hidden)");
    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-specifications") && res.request().method() === "DELETE"
      ),
      page.locator(".ant-popconfirm .ant-btn-dangerous").click(),
    ]);

    await expect(drawer.locator(".ant-table")).not.toContainText("6.3 inch 120Hz ProMotion");
  });
});
