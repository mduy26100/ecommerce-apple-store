import { test, expect } from "@playwright/test";

test.describe("Storefront Header Realtime Quick Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3088");
    await page.waitForLoadState("networkidle");
  });

  test("should toggle search bar by clicking search icon button", async ({ page }) => {
    const desktopNav = page.locator("header nav");
    await expect(desktopNav).toBeVisible();

    const searchButton = page.locator('header button[aria-label="Tìm kiếm"]');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    await expect(desktopNav).toBeHidden();

    const searchInput = page.locator('header input[placeholder*="Tìm kiếm iPhone"]').first();
    await expect(searchInput).toBeVisible();

    await searchButton.click();

    await expect(searchInput).toBeHidden();
    await expect(desktopNav).toBeVisible();
  });

  test("should close search bar when clicking outside", async ({ page }) => {
    const desktopNav = page.locator("header nav");
    const searchButton = page.locator('header button[aria-label="Tìm kiếm"]');
    await searchButton.click();

    const searchInput = page.locator('header input[placeholder*="Tìm kiếm iPhone"]').first();
    await expect(searchInput).toBeVisible();

    await page.locator("header a:has-text('Urban Stitch')").first().click();

    await expect(searchInput).toBeHidden();
    await expect(desktopNav).toBeVisible();
  });

  test("should enforce minimum 3 characters before calling search API", async ({ page }) => {
    const searchButton = page.locator('header button[aria-label="Tìm kiếm"]');
    await searchButton.click();

    const searchInput = page.locator('header input[placeholder*="Tìm kiếm iPhone"]').first();
    await searchInput.fill("ip");

    await expect(page.locator("text=Vui lòng nhập tối thiểu 3 ký tự để tìm kiếm sản phẩm...").first()).toBeVisible();

    await searchInput.fill("iphone");

    const searchResultItems = page.locator("header .divide-y > div");
    await expect(searchResultItems.first()).toBeVisible({ timeout: 5000 });

    const itemCount = await searchResultItems.count();
    expect(itemCount).toBeGreaterThan(0);

    const firstItemText = await searchResultItems.first().textContent();
    expect(firstItemText?.toLowerCase()).toContain("iphone");
  });

  test("should navigate to product detail when clicking a search result", async ({ page }) => {
    const searchButton = page.locator('header button[aria-label="Tìm kiếm"]');
    await searchButton.click();

    const searchInput = page.locator('header input[placeholder*="Tìm kiếm iPhone"]').first();
    await searchInput.fill("iphone");

    const searchResultItems = page.locator("header .divide-y > div");
    await expect(searchResultItems.first()).toBeVisible({ timeout: 5000 });

    await searchResultItems.first().click();

    await page.waitForURL(/\/products\/[^?]+/);
    expect(page.url()).toContain("/products/");

    await expect(searchInput).toBeHidden();
  });

  test("should navigate to /products?q=...&page=1 when viewing all results", async ({ page }) => {
    const searchButton = page.locator('header button[aria-label="Tìm kiếm"]');
    await searchButton.click();

    const searchInput = page.locator('header input[placeholder*="Tìm kiếm iPhone"]').first();
    await searchInput.fill("iphone");

    const viewAllButton = page.locator('[data-testid="header-search-view-all"]');
    await expect(viewAllButton).toBeVisible({ timeout: 5000 });
    await viewAllButton.click();

    await page.waitForURL(/\/products\?q=iphone&page=1/);
    expect(page.url()).toContain("/products?q=iphone&page=1");
    await expect(searchInput).toBeHidden();
  });

  test("should close search dropdown when pressing Escape key", async ({ page }) => {
    const searchButton = page.locator('header button[aria-label="Tìm kiếm"]');
    await searchButton.click();

    const searchInput = page.locator('header input[placeholder*="Tìm kiếm iPhone"]').first();
    await expect(searchInput).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(searchInput).toBeHidden();
    await expect(page.locator("header nav")).toBeVisible();
  });

  test("should display fullscreen search overlay on mobile viewport and navigate to view all results", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const searchButton = page.locator('header button[aria-label="Tìm kiếm"]');
    await searchButton.click();

    const mobileOverlay = page.locator(".fixed.inset-0.bg-white.flex.flex-col");
    await expect(mobileOverlay).toBeVisible();

    const mobileInput = mobileOverlay.locator('input[placeholder*="Tìm kiếm iPhone"]');
    await expect(mobileInput).toBeVisible();

    await mobileInput.click();
    await expect(mobileOverlay).toBeVisible();

    await mobileInput.fill("iphone");

    const mobileResultItems = mobileOverlay.locator(".divide-y > div");
    await expect(mobileResultItems.first()).toBeVisible({ timeout: 5000 });

    const viewAllBtn = mobileOverlay.locator('[data-testid="mobile-search-view-all"]');
    await expect(viewAllBtn).toBeVisible();
    await viewAllBtn.click();

    await page.waitForURL(/\/products\?q=iphone&page=1/);
    expect(page.url()).toContain("/products?q=iphone&page=1");
    await expect(mobileOverlay).toBeHidden();
  });
});
