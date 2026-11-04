import { test, expect } from "@playwright/test";

test.describe("Admin - Chi tiết sản phẩm & Thêm phiên bản (Page Navigation & Add Variant)", () => {
  const uniqueId = Date.now();
  const testProductName = `MacBook Pro M4 ${uniqueId}`;
  const testProductSlug = `macbook-pro-m4-${uniqueId}`;
  const testSku = `MBP14-M4-${uniqueId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    }
  });

  test("Kiểm tra luồng tạo sản phẩm trên Page riêng -> chuyển đến trang chi tiết -> thêm variant", async ({ page }) => {
    await page.goto("/admin/products/new");
    await page.waitForLoadState("networkidle");

    await page.fill("input#name", testProductName);
    await page.fill("input#slug", testProductSlug);
    await page.fill("input#modelCode", "A3112");
    await page.fill("input#warrantyMonths", "12");

    await page.locator("input#categoryId, .ant-select-selector:has(#categoryId)").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();

    const [createResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click("button:has-text('Tạo sản phẩm mới')"),
    ]);

    expect(createResponse.status()).toBeLessThan(400);
    const json = await createResponse.json();
    const createdProductId = json.data?.id || json.id;

    await page.waitForURL((url) => url.pathname.includes(`/admin/products/${createdProductId}`));
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1").first()).toContainText(testProductName);

    // Chuyển sang tab Biến thể & Tồn kho
    await page.locator("button[role='tab']:has-text('Phiên bản'), [role='tab']:has-text('Phiên bản')").click();
    await expect(page.locator("button:has-text('Thêm phiên bản mới')")).toBeVisible();

    await page.click("button:has-text('Thêm phiên bản mới')");
    const variantModal = page.locator(".ant-modal");
    await expect(variantModal).toBeVisible();

    await page.fill("input#sku", testSku);
    await page.fill("input#variantName", "16GB RAM - 512GB SSD");
    await page.fill("input#price", "39990000");
    await page.fill("input#quantityInStock", "25");

    const [variantResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(variantResponse.status()).toBeLessThan(400);
    await expect(variantModal).not.toBeVisible();

    await expect(page.locator(".ant-table")).toContainText(testSku);
    await expect(page.locator(".ant-table")).toContainText("16GB RAM - 512GB SSD");

    // Dọn dẹp: Xóa sản phẩm thử nghiệm
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");
    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    if (await row.isVisible()) {
      await row.locator("button[aria-label='Xóa sản phẩm'], button:has(.anticon-delete)").click();
      const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
      await popconfirm.locator("button:has-text('Xóa')").click();
    }
  });
});
