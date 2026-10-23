import { test, expect } from "@playwright/test";

test.describe("Đồng bộ Màu sắc mặc định hiển thị giữa Admin và Trang Chi Tiết Public", () => {
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

  test("Thay đổi Màu sắc mặc định trong Admin và kiểm tra đồng bộ tức thì tại /products/iphone-16-pro-max", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator("input[placeholder*='Tìm theo tên']");
    await searchInput.fill("iPhone 16 Pro Max");
    await page.waitForLoadState("networkidle");

    const row = page.locator(".ant-table-row:has-text('iPhone 16 Pro Max')").first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator(".ant-tag:has-text('phiên bản'), .ant-table-cell:first-child").first().click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible({ timeout: 10000 });

    await drawer.locator(".ant-tabs-tab:has-text('Hình ảnh theo màu')").click();
    await expect(drawer.getByText("Quản lý hình ảnh theo màu sắc").first()).toBeVisible({ timeout: 10000 });

    const defaultColorSelect = drawer.locator(".ant-select:has(#selectDefaultProductColor)");
    await expect(defaultColorSelect).toBeVisible({ timeout: 10000 });

    const currentText = await defaultColorSelect.innerText();
    const isCurrentlyDesert = currentText.includes("Titan Sa Mạc");
    const firstTarget = isCurrentlyDesert ? "Titan Trắng" : "Titan Sa Mạc";
    const secondTarget = isCurrentlyDesert ? "Titan Sa Mạc" : "Titan Trắng";

    const dropdown = page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");

    await defaultColorSelect.click();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const firstOption = dropdown.locator(`.ant-select-item-option:has-text('${firstTarget}')`).first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/default-color/") && res.request().method() === "PUT" && res.status() === 200,
        { timeout: 15000 }
      ),
      firstOption.click(),
    ]);

    await expect(defaultColorSelect).toContainText(firstTarget, { timeout: 10000 });

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const colorGroup = page.locator("[data-testid='color-options-group']");
    await expect(colorGroup).toBeVisible({ timeout: 10000 });

    const activeColorFirst = colorGroup.locator("button[data-selected='true']");
    await expect(activeColorFirst).toBeVisible({ timeout: 10000 });
    await expect(activeColorFirst).toContainText(firstTarget);

    const mainImageFirst = page.locator("[data-testid='main-product-image']");
    await expect(mainImageFirst).toBeVisible({ timeout: 10000 });
    expect(await mainImageFirst.getAttribute("src")).toBeTruthy();

    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");
    await searchInput.fill("iPhone 16 Pro Max");
    await page.waitForLoadState("networkidle");
    await page.locator(".ant-table-row:has-text('iPhone 16 Pro Max')").first().locator(".ant-tag:has-text('phiên bản'), .ant-table-cell:first-child").first().click();
    await expect(drawer).toBeVisible({ timeout: 10000 });
    await drawer.locator(".ant-tabs-tab:has-text('Hình ảnh theo màu')").click();
    await expect(defaultColorSelect).toBeVisible({ timeout: 10000 });

    await defaultColorSelect.click();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const secondOption = dropdown.locator(`.ant-select-item-option:has-text('${secondTarget}')`).first();
    await expect(secondOption).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/default-color/") && res.request().method() === "PUT" && res.status() === 200,
        { timeout: 15000 }
      ),
      secondOption.click(),
    ]);

    await expect(defaultColorSelect).toContainText(secondTarget, { timeout: 10000 });

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");
    const activeColorSecond = colorGroup.locator("button[data-selected='true']");
    await expect(activeColorSecond).toBeVisible({ timeout: 10000 });
    await expect(activeColorSecond).toContainText(secondTarget);

    const mainImageSecond = page.locator("[data-testid='main-product-image']");
    await expect(mainImageSecond).toBeVisible({ timeout: 10000 });
    expect(await mainImageSecond.getAttribute("src")).toBeTruthy();
  });

  test("Khi ở tab Tất cả ảnh thì ẩn tính năng Đặt chính và tag Ảnh chính; khi chọn màu cụ thể thì hiển thị", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator("input[placeholder*='Tìm theo tên']");
    await searchInput.fill("iPhone 16 Pro Max");
    await page.waitForLoadState("networkidle");

    const row = page.locator(".ant-table-row:has-text('iPhone 16 Pro Max')").first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator(".ant-tag:has-text('phiên bản'), .ant-table-cell:first-child").first().click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible({ timeout: 10000 });

    await drawer.locator(".ant-tabs-tab:has-text('Hình ảnh theo màu')").click();
    await expect(drawer.getByText("Quản lý hình ảnh theo màu sắc").first()).toBeVisible({ timeout: 10000 });

    const allBtn = drawer.locator("button:has-text('Tất cả ảnh')");
    await expect(allBtn).toBeVisible({ timeout: 10000 });
    await allBtn.click();

    await expect(drawer.locator("button:has-text('Đặt chính')")).toHaveCount(0);
    await expect(drawer.locator(".ant-tag:has-text('Ảnh chính')")).toHaveCount(0);
    await expect(drawer.getByText("Chọn màu để đổi ảnh chính").first()).toBeVisible({ timeout: 10000 });

    const colorPill = drawer.locator("button:has-text('Titan Sa Mạc')");
    await expect(colorPill).toBeVisible({ timeout: 10000 });
    await colorPill.click();

    await expect(drawer.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible({ timeout: 10000 });
    await expect(drawer.getByText("Chính").first()).toBeVisible({ timeout: 10000 });
  });
});
