import { test, expect } from "@playwright/test";

test.describe("Smoke Test - Nền tảng Urban Stitch", () => {
  test("Kiểm tra trang chủ Storefront và thương hiệu Urban Stitch", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#root")).toBeAttached();
    await expect(page).toHaveTitle(/Urban Stitch/);
    await expect(page.locator("header")).toContainText("Urban Stitch");
    await expect(page.locator("footer")).toContainText("Urban Stitch");
  });

  test("Kiểm tra cổng quản trị Admin và thương hiệu Urban Stitch", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#root")).toBeAttached();
    await expect(page.locator("body")).toContainText("Urban Stitch");

    await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
    await page.fill("input#password, input[name='password']", "Admin@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/admin/**");

    await expect(page.locator(".ant-layout, aside, main").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("aside")).toContainText("Urban Stitch Admin");
  });
});
