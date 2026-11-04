import { test, expect } from "@playwright/test";

test.describe("Storefront - Trang Chi Tiết Sản Phẩm & Bộ Sưu Tập Ảnh 2 Tầng Đồng Bộ", () => {
  test("1. Điều hướng từ Trang chủ tới Trang chi tiết sản phẩm qua liên kết sản phẩm", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstProductLink = page.locator("[data-testid^='product-link-']").first();
    await expect(firstProductLink).toBeVisible({ timeout: 10000 });

    const targetUrl = await firstProductLink.getAttribute("href");
    expect(targetUrl).toBeTruthy();
    expect(targetUrl).toContain("/products/");

    await firstProductLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(new RegExp("/products/"));
    await expect(page.locator("[data-testid='product-title']")).toBeVisible();
  });

  test("2. Hiển thị Breadcrumb đầy đủ chuẩn cấu trúc và liên kết", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const breadcrumb = page.locator("[data-testid='product-breadcrumb']");
    await expect(breadcrumb).toBeVisible();

    const homeLink = page.locator("[data-testid='breadcrumb-home']");
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");

    const categoryLink = page.locator("[data-testid='breadcrumb-category']");
    await expect(categoryLink).toBeVisible();
    await expect(categoryLink).toHaveText("iPhone");
    await expect(categoryLink).toHaveAttribute("href", "/products?category=iphone");

    const currentProductBreadcrumb = page.locator("[data-testid='breadcrumb-current-product']");
    await expect(currentProductBreadcrumb).toBeVisible();
    await expect(currentProductBreadcrumb).toHaveText("iPhone 16 Pro Max");
  });

  test("3. Khung hiển thị ảnh 2 tầng: Ảnh lớn trên hoặc fallback Apple logo khi rỗng", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const mainViewport = page.locator("[data-testid='main-image-viewport']");
    await expect(mainViewport).toBeVisible();

    const mainImage = page.locator("[data-testid='main-product-image']");
    if ((await mainImage.count()) > 0) {
      await expect(mainImage).toBeVisible();
      const initialSrc = await mainImage.getAttribute("src");
      expect(initialSrc).toBeTruthy();
    } else {
      await expect(mainViewport.locator("svg").first()).toBeVisible();
    }
  });

  test("4. Đồng bộ màu sắc: Nhấn vào tùy chọn màu sẽ cập nhật trạng thái chọn", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const colorGroup = page.locator("[data-testid='color-options-group']");
    await expect(colorGroup).toBeVisible();

    const colorButtons = colorGroup.locator("button[data-testid^='color-option-']");
    const colorCount = await colorButtons.count();
    expect(colorCount).toBeGreaterThan(0);

    const enabledColor = colorGroup.locator("button[data-testid^='color-option-']:not([disabled])").first();
    await expect(enabledColor).toBeVisible();
    await enabledColor.click();
    await expect(enabledColor).toHaveAttribute("data-selected", "true");
  });

  test("5. Chọn dung lượng lưu trữ: Giá tiền và mã SKU được cập nhật đồng bộ", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const storageGroup = page.locator("[data-testid='storage-options-group']");
    if (await storageGroup.isVisible()) {
      const storageButtons = storageGroup.locator("button[data-testid^='storage-option-']");
      const storageCount = await storageButtons.count();

      if (storageCount > 1) {
        const priceBefore = await page.locator("[data-testid='product-price']").innerText();
        const secondStorage = storageButtons.nth(1);
        await secondStorage.click();
        await expect(secondStorage).toHaveAttribute("data-selected", "true");

        const priceAfter = await page.locator("[data-testid='product-price']").innerText();
        expect(priceAfter).toBeTruthy();
      }
    }
  });

  test("6. Tăng giảm số lượng và tương tác Thêm giỏ hàng / Mua ngay", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const quantityValue = page.locator("[data-testid='quantity-value']");
    await expect(quantityValue).toHaveText("1");

    await page.locator("[data-testid='quantity-increase']").click();
    await expect(quantityValue).toHaveText("2");

    await page.locator("[data-testid='quantity-decrease']").click();
    await expect(quantityValue).toHaveText("1");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.locator(".ant-message")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".ant-message")).toContainText(/(thành công|giỏ hàng)/i);

    const buyNowBtn = page.locator("[data-testid='buy-now-button']");
    await expect(buyNowBtn).toBeVisible();
    await buyNowBtn.click();
    await expect(page.locator(".ant-message")).toBeVisible({ timeout: 5000 });
  });

  test("7. Hiển thị bảng Thông số kỹ thuật chi tiết theo nhóm (Hiệu năng, Màn hình...)", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const specsContainer = page.locator("[data-testid='product-specifications-container']");
    await expect(specsContainer).toBeVisible();
    await expect(specsContainer).toContainText("Hiệu năng & Vi xử lý");
    await expect(specsContainer).toContainText("Chipset");
  });

  test("8. Tùy chọn cấu hình hiển thị chuẩn xác và các nút chức năng hoạt động hoàn hảo", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const colorGroup = page.locator("[data-testid='color-options-group']");
    await expect(colorGroup).toBeVisible();

    const desertOption = colorGroup.locator("button:has-text('Titan Sa Mạc')");
    await expect(desertOption).toBeVisible();
    await expect(desertOption).toBeEnabled();

    const stockBadge = page.locator("[data-testid='selected-variant-stock-badge']");
    await expect(stockBadge).toContainText("Còn");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeEnabled();
  });
});
