import { test, expect } from "@playwright/test";

test.describe("Smoke Test - Nền tảng Apple Store", () => {
  test("Kiểm tra trang chủ Storefront", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#root")).toBeAttached();
    await expect(page.locator("header, nav, main").first()).toBeVisible();
  });

  test("Kiểm tra cổng quản trị Admin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#root")).toBeAttached();
    await expect(page.locator(".ant-layout, aside, main").first()).toBeVisible();
  });
});
