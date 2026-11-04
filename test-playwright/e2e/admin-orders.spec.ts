import { test, expect } from "@playwright/test";

test.describe("Admin - Quản trị Đơn hàng & Snapshot (Orders Management)", () => {
  const uniqueId = Date.now();
  const testCustomerName = `Nguyễn Văn Test ${uniqueId}`;
  const testCustomerPhone = "0988776655";

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

  test("Hiển thị trang quản lý đơn hàng và bảng dữ liệu", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Đơn hàng/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("input[placeholder*='Tìm theo mã đơn']")).toBeVisible();
  });

  test("Khởi tạo đơn hàng mẫu qua Storefront và kiểm tra hiển thị trên bảng quản trị", async ({ page }) => {
    // 1. Thao tác mua hàng thực tế qua Storefront UI theo Rule 3
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const checkoutBtn = page.locator("[data-testid='cart-checkout-button']");
    await checkoutBtn.click();
    await page.waitForURL("**/checkout");

    await page.fill("input#recipientName", testCustomerName);
    await page.fill("input#recipientPhone", testCustomerPhone);
    await page.fill("input#recipientEmail", `order_${uniqueId}@apple-test.com`);
    await page.fill("input#shippingProvince", "Hồ Chí Minh");
    await page.fill("input#shippingAddressLine", "123 Nguyễn Huệ, Phường Bến Nghé");

    const [orderResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(orderResponse.status()).toBe(200);

    // 2. Admin vào trang quản lý đơn hàng kiểm tra hiển thị
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    const table = page.locator(".ant-table");
    await expect(table).toContainText(testCustomerName);
    await expect(table).toContainText("Hồ Chí Minh");
  });

  test("Xem chi tiết đơn hàng và kiểm tra snapshot sản phẩm khi đặt", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testCustomerName}')`);
    await row.locator("button[aria-label='Xem chi tiết đơn hàng']").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Chi tiết đơn hàng");
    await expect(drawer).toContainText(testCustomerName);
    await expect(drawer).toContainText(testCustomerPhone);
    await expect(drawer).toContainText("123 Nguyễn Huệ");
  });

  test("Cập nhật trạng thái đơn hàng sang Đã xác nhận", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testCustomerName}')`);
    await row.locator("button[aria-label='Đổi trạng thái']").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Cập nhật trạng thái");

    await modal.locator(".ant-select").first().click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Đã xác nhận')").click();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/orders/") && res.url().includes("/status") && res.request().method() === "PUT"
      ),
      modal.locator(".ant-modal-footer button:has-text('Lưu thay đổi')").click(),
    ]);

    await expect(modal).not.toBeVisible();
    await expect(page.locator(`.ant-table-row:has-text('${testCustomerName}')`)).toContainText("Đã xác nhận");
  });

  test("Lọc danh sách đơn hàng theo trạng thái", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    await page.locator(".ant-select:has-text('Tất cả trạng thái')").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Đã xác nhận')").click();

    await page.waitForLoadState("networkidle");
    const table = page.locator(".ant-table");
    await expect(table).toContainText(testCustomerName);
    await expect(table).toContainText("Đã xác nhận");
  });
});
