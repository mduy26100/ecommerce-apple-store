import { test, expect } from "@playwright/test";

test.describe("Storefront HomePage - Khối Danh Mục và Lưới Sản Phẩm", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị đầy đủ 7 khối danh mục chuẩn Apple theo chiều dọc", async ({ page }) => {
    const expectedCategories = [
      "iPhone",
      "MacBook",
      "iPad",
      "Apple Watch",
      "AirPods & Âm thanh",
      "iMac & Mac Desktop",
      "Phụ kiện Apple",
    ];

    for (const catName of expectedCategories) {
      const heading = page.locator(`h3:has-text("${catName}")`).first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    }
  });

  test("Mỗi khối danh mục có đầy đủ 3 phần: Tiêu đề trung tâm, Lưới 4 sản phẩm, và Chân khối", async ({ page }) => {
    const categoriesToCheck = [
      "iphone",
      "macbook",
      "ipad",
      "apple-watch",
      "airpods-am-thanh",
      "imac-mac-desktop",
      "phu-kien-apple",
    ];

    for (const slug of categoriesToCheck) {
      const section = page.locator(`[data-testid='category-block-${slug}']`);
      await expect(section).toBeVisible({ timeout: 10000 });
      const cards = section.locator("[data-testid^='product-card-']");
      await expect(cards).toHaveCount(4);
    }

    const macbookSection = page.locator("[data-testid='category-block-macbook']");
    const firstCard = macbookSection.locator("[data-testid^='product-card-']").first();
    await expect(firstCard.locator("[data-testid^='chip-badge-']")).toBeVisible();
    await expect(firstCard.locator("[data-testid^='status-badge-']")).toBeVisible();
    await expect(firstCard.locator("[data-testid='product-image-container']")).toBeVisible();
    await expect(firstCard.locator("h4")).toBeVisible();
    await expect(firstCard.locator("text=₫")).toBeVisible();

    const footerLink = macbookSection.locator("[data-testid='view-all-macbook']");
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toContainText("Xem tất cả MacBook");
  });

  test("Kích thước các thẻ sản phẩm trong cùng hàng có chiều cao cân đối tương xứng", async ({ page }) => {
    const iphoneSection = page.locator("[data-testid='category-block-iphone']");
    await expect(iphoneSection).toBeVisible({ timeout: 10000 });

    const cards = iphoneSection.locator("[data-testid^='product-card-']");
    await expect(cards).toHaveCount(4);

    const heights = await cards.evaluateAll((elements) =>
      elements.map((el) => Math.round(el.getBoundingClientRect().height))
    );

    const firstHeight = heights[0];
    for (const h of heights) {
      expect(Math.abs(h - firstHeight)).toBeLessThanOrEqual(5);
    }
  });

  test("Fallback hiển thị logo quả táo Apple khi ảnh sản phẩm bị lỗi", async ({ page }) => {
    const firstImg = page.locator("[data-testid='product-image-container'] img").first();
    await expect(firstImg).toBeVisible();

    await firstImg.evaluate((img: HTMLImageElement) => {
      img.dispatchEvent(new Event("error"));
    });

    const appleLogoFallback = page.locator("[data-testid='product-image-container'] svg").first();
    await expect(appleLogoFallback).toBeVisible();
  });

  test("Thẻ sản phẩm hiển thị đầy đủ chip badge, status badge, specs và giá tiền", async ({ page }) => {
    const iphoneSection = page.locator("[data-testid='category-block-iphone']");
    await expect(iphoneSection).toBeVisible({ timeout: 10000 });

    const iphoneCards = iphoneSection.locator("[data-testid^='product-card-']");
    await expect(iphoneCards).toHaveCount(4);

    const firstCard = iphoneCards.first();
    const chipBadge = firstCard.locator("[data-testid^='chip-badge-']");
    await expect(chipBadge).toBeVisible();
    const chipText = await chipBadge.textContent();
    expect(chipText).toBeTruthy();

    const statusBadge = firstCard.locator("[data-testid^='status-badge-']");
    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.textContent();
    expect(["BÁN CHẠY", "SẴN HÀNG"]).toContain(statusText?.trim());

    const priceText = await firstCard.locator("span.text-blue-600").textContent();
    expect(priceText).toContain("₫");
  });

  test("Chân khối có liên kết điều hướng hợp lệ", async ({ page }) => {
    const ipadSection = page.locator("[data-testid='category-block-ipad']");
    await expect(ipadSection).toBeVisible({ timeout: 10000 });

    const viewAllLink = ipadSection.locator("[data-testid='view-all-ipad']");
    await expect(viewAllLink).toBeVisible();
    await expect(viewAllLink).toHaveAttribute("href", "/products?category=ipad");
  });
});
