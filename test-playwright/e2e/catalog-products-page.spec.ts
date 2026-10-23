import { test, expect } from "@playwright/test";

test.describe("Storefront - Trang Sản Phẩm Theo Danh Mục và Lọc / Sắp Xếp", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/products?category=iphone");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị đầy đủ thanh Breadcrumbs góc trên bên trái", async ({ page }) => {
    const breadcrumbs = page.locator("[data-testid='catalog-breadcrumbs']");
    await expect(breadcrumbs).toBeVisible({ timeout: 10000 });

    const homeLink = breadcrumbs.locator("a:has-text('Trang chủ')");
    await expect(homeLink).toBeVisible();

    const productsLink = breadcrumbs.locator("a:has-text('Sản phẩm')");
    await expect(productsLink).toBeVisible();

    const categoryItem = breadcrumbs.locator("text=iPhone");
    await expect(categoryItem).toBeVisible();
  });

  test("Hiển thị tiêu đề thể loại iPhone và phần mô tả danh mục", async ({ page }) => {
    const title = page.locator("[data-testid='catalog-category-title']");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("iPhone");

    const desc = page.locator("[data-testid='catalog-category-desc']");
    await expect(desc).toBeVisible();
  });

  test("Thanh công cụ lọc và sắp xếp (Filter & Sort Bar) hiển thị đầy đủ công cụ", async ({ page }) => {
    const filterBar = page.locator("[data-testid='filter-sort-bar']");
    await expect(filterBar).toBeVisible();

    const searchInput = filterBar.locator("input[placeholder*='Tìm kiếm sản phẩm']");
    await expect(searchInput).toBeVisible();

    const selects = filterBar.locator(".ant-select");
    await expect(selects).toHaveCount(2);

    const totalCount = page.locator("[data-testid='catalog-total-count']");
    await expect(totalCount).toBeVisible();
    const countText = await totalCount.textContent();
    expect(parseInt(countText || "0", 10)).toBeGreaterThanOrEqual(20);
  });

  test("Lưới sản phẩm hiển thị chuẩn 20 sản phẩm trên trang đầu tiên", async ({ page }) => {
    const productCards = page.locator("[data-testid^='product-card-']");
    await expect(productCards).toHaveCount(20);

    const firstCard = productCards.first();
    await expect(firstCard.locator("[data-testid^='chip-badge-']")).toBeVisible();
    await expect(firstCard.locator("[data-testid^='status-badge-']")).toBeVisible();
    await expect(firstCard.locator("[data-testid='product-image-container']")).toBeVisible();
    await expect(firstCard.locator("h4")).toBeVisible();
    await expect(firstCard.locator("text=₫")).toBeVisible();
  });

  test("Phân trang backend hoạt động chính xác khi chuyển sang trang 2", async ({ page }) => {
    const pagination = page.locator("[data-testid='catalog-pagination']");
    await expect(pagination).toBeVisible();

    const page2Button = pagination.locator(".ant-pagination-item-2");
    await expect(page2Button).toBeVisible();
    await page2Button.click();

    await page.waitForURL(/page=2/);
    await page.waitForLoadState("networkidle");

    const productCardsPage2 = page.locator("[data-testid^='product-card-']");
    await expect(productCardsPage2).toHaveCount(14);

    const page1Button = pagination.locator(".ant-pagination-item-1");
    await expect(page1Button).toBeVisible();
    await page1Button.click();

    await page.waitForURL(/page=1/);
    await page.waitForLoadState("networkidle");

    const productCardsPage1 = page.locator("[data-testid^='product-card-']");
    await expect(productCardsPage1).toHaveCount(20);
  });

  test("Chuyển danh mục qua các tab danh mục nhanh trên thanh tiêu đề", async ({ page }) => {
    const macbookTab = page.locator("[data-testid='category-filter-tab-macbook']");
    await expect(macbookTab).toBeVisible();
    await macbookTab.click();

    await page.waitForURL(/category=macbook/);
    await page.waitForLoadState("networkidle");

    const title = page.locator("[data-testid='catalog-category-title']");
    await expect(title).toHaveText("MacBook");

    const cards = page.locator("[data-testid^='product-card-']");
    await expect(cards).toHaveCount(20);
  });

  test("Điều hướng từ HomePage qua nút Xem tất cả danh mục mở đúng trang", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const viewAllIphone = page.locator("[data-testid='view-all-iphone']");
    await expect(viewAllIphone).toBeVisible();
    await viewAllIphone.click();

    await page.waitForURL("/products?category=iphone");
    await page.waitForLoadState("networkidle");

    const title = page.locator("[data-testid='catalog-category-title']");
    await expect(title).toHaveText("iPhone");
  });

  test("Breadcrumbs điều hướng quay trở lại Trang chủ và Tất cả sản phẩm thành công", async ({ page }) => {
    const homeLink = page.locator("[data-testid='catalog-breadcrumbs'] a:has-text('Trang chủ')");
    await homeLink.click();
    await page.waitForURL("/");

    await page.goto("/products?category=iphone");
    await page.waitForLoadState("networkidle");

    const productsLink = page.locator("[data-testid='catalog-breadcrumbs'] a:has-text('Sản phẩm')");
    await productsLink.click();
    await page.waitForURL("/products");
    await page.waitForLoadState("networkidle");

    const title = page.locator("[data-testid='catalog-category-title']");
    await expect(title).toHaveText("Tất cả sản phẩm Apple");
  });

  test("Tự động cuộn lên đầu trang khi điều hướng từ cuối trang chủ tới trang sản phẩm", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const scrolledY = await page.evaluate(() => window.scrollY);
    expect(scrolledY).toBeGreaterThan(500);

    const viewAllLink = page.locator("[data-testid='view-all-ipad']");
    await expect(viewAllLink).toBeVisible();
    await viewAllLink.click();

    await page.waitForURL("/products?category=ipad");
    await expect(page.locator("[data-testid='catalog-category-title']")).toHaveText("iPad");

    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeLessThanOrEqual(50);
  });

  test("Header hiển thị trạng thái active cho danh mục hiện tại", async ({ page }) => {
    await page.goto("/products?category=iphone");
    await page.waitForLoadState("networkidle");

    const iphoneNav = page.locator("[data-testid='header-nav-category-iphone']").first();
    await expect(iphoneNav).toBeVisible();
    await expect(iphoneNav).toHaveAttribute("data-active", "true");
    await expect(iphoneNav).toHaveClass(/text-blue-600/);

    const macbookNav = page.locator("[data-testid='header-nav-category-macbook']").first();
    await expect(macbookNav).toBeVisible();
    await expect(macbookNav).not.toHaveAttribute("data-active", "true");

    await macbookNav.click();
    await page.waitForURL("/products?category=macbook");
    await expect(page.locator("[data-testid='catalog-category-title']")).toHaveText("MacBook");

    await expect(macbookNav).toHaveAttribute("data-active", "true");
    await expect(macbookNav).toHaveClass(/text-blue-600/);
    await expect(iphoneNav).not.toHaveAttribute("data-active", "true");
  });
});
