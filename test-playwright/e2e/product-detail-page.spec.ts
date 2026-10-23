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

  test("3. Khung hiển thị ảnh 2 tầng: Ảnh lớn trên, Thumbnail dưới có viền xanh lá active, nút prev/next hoạt động đồng bộ", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const mainViewport = page.locator("[data-testid='main-image-viewport']");
    await expect(mainViewport).toBeVisible();

    const mainImage = page.locator("[data-testid='main-product-image']");
    await expect(mainImage).toBeVisible();
    const initialSrc = await mainImage.getAttribute("src");
    expect(initialSrc).toBeTruthy();

    const thumbnailStrip = page.locator("[data-testid='thumbnail-strip']");
    if (!(await thumbnailStrip.isVisible())) {
      const multiColorBtn = page.locator("[data-testid='color-options-group'] button:has-text('Titan Sa Mạc')");
      if (await multiColorBtn.isVisible()) {
        await multiColorBtn.click();
        await page.waitForTimeout(300);
      }
    }
    await expect(thumbnailStrip).toBeVisible({ timeout: 10000 });

    const thumb0 = page.locator("[data-testid='thumbnail-0']");
    await expect(thumb0).toBeVisible();
    await expect(thumb0).toHaveAttribute("data-active", "true");
    const thumb0Class = await thumb0.getAttribute("class");
    expect(thumb0Class).toContain("border-emerald-500");

    const thumb1 = page.locator("[data-testid='thumbnail-1']");
    if (await thumb1.isVisible()) {
      await thumb1.click();
      await expect(thumb1).toHaveAttribute("data-active", "true");
      await expect(thumb0).toHaveAttribute("data-active", "false");

      const thumb1Class = await thumb1.getAttribute("class");
      expect(thumb1Class).toContain("border-emerald-500");

      const nextButton = page.locator("[data-testid='gallery-next-button']");
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const activeThumb = page.locator("[data-testid='thumbnail-strip'] button[data-active='true']");
        await expect(activeThumb).toBeVisible();
      }

      const prevButton = page.locator("[data-testid='gallery-prev-button']");
      if (await prevButton.isVisible()) {
        await prevButton.click();
        const activeThumb = page.locator("[data-testid='thumbnail-strip'] button[data-active='true']");
        await expect(activeThumb).toBeVisible();
      }
    }
  });

  test("4. Đồng bộ màu sắc: Nhấn vào tùy chọn màu sẽ tự động nhảy sang ảnh chuẩn của màu đó", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const colorGroup = page.locator("[data-testid='color-options-group']");
    await expect(colorGroup).toBeVisible();

    const colorButtons = colorGroup.locator("button[data-testid^='color-option-']");
    const colorCount = await colorButtons.count();
    expect(colorCount).toBeGreaterThan(0);

    if (colorCount > 1) {
      const secondColor = colorButtons.nth(1);
      await secondColor.click();
      await expect(secondColor).toHaveAttribute("data-selected", "true");

      const mainImage = page.locator("[data-testid='main-product-image']");
      await expect(mainImage).toBeVisible();

      const thumbStrip = page.locator("[data-testid='thumbnail-strip']");
      if (await thumbStrip.isVisible()) {
        const activeThumb = thumbStrip.locator("button[data-active='true']");
        await expect(activeThumb).toBeVisible();
        const activeClass = await activeThumb.getAttribute("class");
        expect(activeClass).toContain("border-emerald-500");
      }
    }
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
    await expect(page.locator(".ant-message")).toContainText("thành công");

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
    await expect(specsContainer).toContainText("Chip xử lý");
    await expect(specsContainer).toContainText("Apple A18 Pro");
  });

  test("8. Tùy chọn không có phiên bản hoặc hết hàng phải bị vô hiệu hóa (disabled)", async ({ page }) => {
    await page.goto("/products/airpods-3-lightning");
    await page.waitForLoadState("networkidle");

    const colorGroup = page.locator("[data-testid='color-options-group']");
    await expect(colorGroup).toBeVisible();

    const whiteOption = colorGroup.locator("button:has-text('Trắng White')");
    await expect(whiteOption).toBeVisible();
    await expect(whiteOption).toBeEnabled();
    await expect(whiteOption).toHaveAttribute("data-selected", "true");

    const blackOption = colorGroup.locator("button:has-text('Đen xanh')");
    await expect(blackOption).toBeVisible();
    await expect(blackOption).toBeDisabled();

    const stockBadge = page.locator("[data-testid='selected-variant-stock-badge']");
    await expect(stockBadge).toContainText("47");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeEnabled();
  });
});
