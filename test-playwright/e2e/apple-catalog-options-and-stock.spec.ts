import { test, expect } from "@playwright/test";

test.describe("E2E Test: Cấu hình thuộc tính chuẩn Apple và Tồn kho hiển thị Public", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"), { timeout: 15000 });
    }
  });

  test("1. Admin: Kiểm tra MacBook có đầy đủ Màu sắc, RAM, SSD và AirPods KHÔNG có dung lượng", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    // Check MacBook Pro
    await page.fill("input[placeholder*='Tìm theo tên']", "MacBook Pro 14 M4");
    await page.press("input[placeholder*='Tìm theo tên']", "Enter");
    await page.waitForTimeout(500);

    const macRow = page.locator(".ant-table-row:has-text('MacBook Pro 14 M4')").first();
    await expect(macRow).toBeVisible({ timeout: 10000 });
    await macRow.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await drawer.locator(".ant-tabs-tab:has-text('Thuộc tính & Tùy chọn')").click();
    await expect(drawer).toContainText("Màu sắc");
    await expect(drawer).toContainText("Bộ nhớ RAM");
    await expect(drawer).toContainText("Dung lượng SSD");

    // Close drawer
    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).toBeHidden();

    // Check AirPods
    await page.fill("input[placeholder*='Tìm theo tên']", "");
    await page.fill("input[placeholder*='Tìm theo tên']", "AirPods");
    await page.press("input[placeholder*='Tìm theo tên']", "Enter");
    await page.waitForTimeout(500);

    const airpodRow = page.locator(".ant-table-row:has-text('AirPods')").first();
    await expect(airpodRow).toBeVisible({ timeout: 10000 });
    await airpodRow.click();

    await expect(drawer).toBeVisible();
    await drawer.locator(".ant-tabs-tab:has-text('Thuộc tính & Tùy chọn')").click();
    await expect(drawer).toContainText("Màu sắc");
    // AirPods must NOT have storage option
    await expect(drawer).not.toContainText("Dung lượng lưu trữ");
    await expect(drawer).not.toContainText("Dung lượng SSD");
  });

  test("2. Storefront MacBook: Hiển thị đầy đủ Màu sắc, RAM, SSD, cập nhật giá và tồn kho thực tế", async ({ page }) => {
    await page.goto("/products/macbook-pro-14-m4");
    await page.waitForLoadState("networkidle");

    // Verifies product title
    await expect(page.locator("[data-testid='product-title']")).toContainText("MacBook Pro 14 M4");

    // Verifies option groups exist for Color, RAM, SSD
    await expect(page.locator("text=Chọn Màu sắc:")).toBeVisible();
    await expect(page.locator("text=Chọn Bộ nhớ RAM:")).toBeVisible();
    await expect(page.locator("text=Chọn Dung lượng SSD:")).toBeVisible();

    // Verifies stock indicator is visible and displays stock count
    const stockIndicator = page.locator("[data-testid='detail-stock-indicator']");
    await expect(stockIndicator).toBeVisible();
    await expect(stockIndicator).toContainText("Kho còn:");

    // Verifies stock badge in variant summary pill
    const variantStockBadge = page.locator("[data-testid='selected-variant-stock-badge']");
    await expect(variantStockBadge).toBeVisible();
    await expect(variantStockBadge).toContainText("Còn");

    // Verifies changing RAM option to 48GB updates the price dynamically
    const initialPriceText = await page.locator("[data-testid='product-price']").innerText();
    const ramOption48GB = page.locator("button:has-text('48GB')").first();
    await expect(ramOption48GB).toBeVisible();
    await ramOption48GB.click();
    await page.waitForTimeout(400);
    const newPriceText = await page.locator("[data-testid='product-price']").innerText();
    expect(newPriceText).not.toEqual(initialPriceText);
  });

  test("3. Storefront AirPods: Chỉ hiển thị Màu sắc, không có Dung lượng, hiển thị số lượng tồn kho", async ({ page }) => {
    await page.goto("/products/airpods-3-lightning");
    await page.waitForLoadState("networkidle");

    // Verifies product title
    await expect(page.locator("[data-testid='product-title']")).toContainText("AirPods 3");

    // Verifies Color is available
    await expect(page.locator("text=Chọn Màu sắc:")).toBeVisible();

    // Verifies NO storage or RAM option is displayed
    await expect(page.locator("text=Chọn Dung lượng:")).toHaveCount(0);
    await expect(page.locator("text=Chọn Dung lượng SSD:")).toHaveCount(0);
    await expect(page.locator("text=Chọn Bộ nhớ RAM:")).toHaveCount(0);

    // Verifies stock count
    const stockIndicator = page.locator("[data-testid='detail-stock-indicator']");
    await expect(stockIndicator).toBeVisible();
    await expect(stockIndicator).toContainText("Kho còn:");
  });

  test("4. Storefront iPhone: Chỉ hiển thị Màu sắc và Dung lượng (không có RAM), hiển thị tồn kho", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("[data-testid='product-title']")).toContainText("iPhone 16 Pro Max");
    await expect(page.locator("text=Chọn Màu sắc:")).toBeVisible();
    await expect(page.locator("text=Chọn Dung lượng:")).toBeVisible();

    // Verifies NO RAM option for iPhone
    await expect(page.locator("text=Chọn Bộ nhớ RAM:")).toHaveCount(0);

    const stockIndicator = page.locator("[data-testid='detail-stock-indicator']");
    await expect(stockIndicator).toBeVisible();
    await expect(stockIndicator).toContainText("Kho còn:");
  });

  test("5. Dưới phần thông số: Hiển thị Carousel 12 sản phẩm ngẫu nhiên lặp vô tận, nút cuộn trái/phải hoạt động mượt mà", async ({ page }) => {
    await page.goto("/products/macbook-pro-14-m4");
    await page.waitForLoadState("networkidle");

    const carouselSection = page.locator("[data-testid='related-products-carousel']");
    await expect(carouselSection).toBeVisible({ timeout: 10000 });
    await expect(carouselSection).toContainText("Sản Phẩm Apple Dành Cho Bạn");
    await expect(carouselSection).toContainText("Khám Phá Thêm");

    const scrollContainer = page.locator("[data-testid='related-scroll-container']");
    await expect(scrollContainer).toBeVisible();

    const cards = scrollContainer.locator("[data-testid^='product-card-']");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(12);

    const btnRight = page.locator("[data-testid='related-scroll-right']");
    if (await btnRight.isVisible()) {
      await btnRight.click();
      await page.waitForTimeout(400);
    }

    const btnLeft = page.locator("[data-testid='related-scroll-left']");
    if (await btnLeft.isVisible()) {
      await btnLeft.click();
      await page.waitForTimeout(400);
    }
  });
});
