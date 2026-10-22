import { test, expect } from "@playwright/test";

test.describe("Storefront - Điều hướng Danh mục (Categories Navigation)", () => {
  test("1. Backend API /api/categories hoạt động chính xác", async ({ request }) => {
    const response = await request.get("http://localhost:5288/api/categories");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    const firstCat = body.data[0];
    expect(firstCat).toHaveProperty("id");
    expect(firstCat).toHaveProperty("name");
    expect(firstCat).toHaveProperty("slug");
  });

  test("2. Desktop Header: Hiển thị tối đa 5 danh mục và nút 3 chấm mở Dropdown", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const nav = page.locator("header nav.hidden.md\\:flex");
    await expect(nav).toBeVisible();

    const directCategoryLinks = nav.locator("> a");
    const count = await directCategoryLinks.count();
    expect(count).toBeLessThanOrEqual(5);

    const moreButton = nav.locator("button[aria-label='Xem thêm danh mục']");
    const isMoreVisible = await moreButton.isVisible();

    if (isMoreVisible) {
      await expect(moreButton).toHaveAttribute("aria-expanded", "false");

      await moreButton.click();
      await expect(moreButton).toHaveAttribute("aria-expanded", "true");

      const dropdown = nav.locator(".custom-scrollbar");
      await expect(dropdown).toBeVisible();

      const dropdownItems = dropdown.locator("a");
      expect(await dropdownItems.count()).toBeGreaterThan(0);

      await page.locator("body").click({ position: { x: 10, y: 10 } });
      await expect(dropdown).not.toBeVisible();
    }
  });

  test("3. Mobile Drawer: Tích hợp đầy đủ danh mục và nút mở rộng Accordion", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const desktopNav = page.locator("header nav.hidden.md\\:flex");
    await expect(desktopNav).not.toBeVisible();

    const menuButton = page.locator("button[aria-label='Menu']");
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const drawer = page.locator(".ant-drawer.ant-drawer-open, .ant-drawer-content-wrapper");
    await expect(drawer.first()).toBeVisible();

    const categoryHeading = drawer.locator("text=Danh mục mua sắm");
    await expect(categoryHeading).toBeVisible();

    const expandButton = drawer.locator("button:has-text('Xem thêm')");
    const hasExpandButton = await expandButton.isVisible();

    if (hasExpandButton) {
      await expandButton.click();
      const collapseButton = drawer.locator("button:has-text('Thu gọn bớt danh mục')");
      await expect(collapseButton).toBeVisible();

      const expandedContainer = drawer.locator(".custom-scrollbar");
      await expect(expandedContainer).toBeVisible();
      expect(await expandedContainer.locator("a").count()).toBeGreaterThan(0);
    }
  });

  test("4. HomePage: Danh mục hiển thị dạng cuộn ngang vô tận, ẩn thanh cuộn và có nút điều hướng trái phải trên Desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const categoryHeading = page.locator("h2:has-text('Danh Mục Sản Phẩm Apple')");
    await expect(categoryHeading).toBeVisible();

    const scrollContainer = page.locator("section:has(h2:has-text('Danh Mục Sản Phẩm Apple')) .no-scrollbar");
    await expect(scrollContainer).toBeVisible();

    const leftButton = page.locator("button[aria-label='Cuộn sang trái']");
    const rightButton = page.locator("button[aria-label='Cuộn sang phải']");
    await expect(leftButton).toBeVisible();
    await expect(rightButton).toBeVisible();

    const initialScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    await page.waitForTimeout(1000);
    const scrolledPosition = await scrollContainer.evaluate((el) => el.scrollLeft);
    expect(scrolledPosition).toBeGreaterThan(initialScroll);

    for (let i = 0; i < 3; i++) {
      await rightButton.click();
      await page.waitForTimeout(150);
      const pos = await scrollContainer.evaluate((el) => el.scrollLeft);
      expect(pos).toBeGreaterThan(0);
    }

    for (let i = 0; i < 3; i++) {
      await leftButton.click();
      await page.waitForTimeout(150);
      const pos = await scrollContainer.evaluate((el) => el.scrollLeft);
      expect(pos).toBeGreaterThan(0);
    }

    const categoryCards = scrollContainer.locator("> div");
    const count = await categoryCards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = categoryCards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator("h3")).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(leftButton).not.toBeVisible();
    await expect(rightButton).not.toBeVisible();
  });
});
