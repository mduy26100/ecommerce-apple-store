import { test, expect } from "@playwright/test";

test.describe("Admin - Chi tiết sản phẩm & Thêm phiên bản (Row Click & Add Variant)", () => {
  const uniqueId = Date.now();
  const testProductName = `MacBook Pro M4 ${uniqueId}`;
  const testProductSlug = `macbook-pro-m4-${uniqueId}`;
  const testSku = `MBP14-M4-${uniqueId}`;

  test("Kiểm tra luồng click vào row sản phẩm -> hiển thị chi tiết sản phẩm -> thêm variant", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm sản phẩm')");
    const productModal = page.locator(".ant-modal");
    await expect(productModal).toBeVisible();

    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();

    await page.fill("input#name", testProductName);
    await page.fill("input#slug", testProductSlug);
    await page.fill("input#modelCode", "A3112");
    await page.fill("input#warrantyMonths", "12");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(productModal).not.toBeVisible();

    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");

    const productRow = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await expect(productRow).toBeVisible();

    await productRow.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Chi tiết sản phẩm & Quản lý phiên bản");
    await expect(drawer).toContainText(testProductName);
    await expect(drawer).toContainText(testProductSlug);

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    const variantModal = page.locator(".ant-modal");
    await expect(variantModal).toBeVisible();

    await page.fill("input#sku", testSku);
    await page.fill("input#variantName", "16GB RAM - 512GB SSD");
    await page.fill("input#price", "39990000");
    await page.fill("input#quantityInStock", "25");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(variantModal).not.toBeVisible();

    await expect(drawer.locator(".ant-table")).toContainText(testSku);
    await expect(drawer.locator(".ant-table")).toContainText("16GB RAM - 512GB SSD");
  });
});
