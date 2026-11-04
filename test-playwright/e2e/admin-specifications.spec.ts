import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Thông số kỹ thuật theo nhóm (Product Specifications Groups)", () => {
  const uniqueId = Date.now();
  const testGroupName = `Tiện ích ${uniqueId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    }
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");
  });

  test("1. Mở quản lý thông số và hiển thị danh sách các nhóm thông số", async ({ page }) => {
    await page.goto("/admin/products/1?tab=specs");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toContainText("Quản lý thông số kỹ thuật theo nhóm");
    await expect(page.locator("button:has-text('Thêm nhóm thông số')")).toBeVisible();

    await expect(page.locator(".ant-card-small:has-text('Hiệu năng')")).toBeVisible();
    await expect(page.locator(".ant-card-small:has-text('Cấu hình')")).toBeVisible();
  });

  test("2. Thêm nhóm thông số mới và hiển thị khối nhóm với thứ tự chuẩn", async ({ page }) => {
    await page.goto("/admin/products/1?tab=specs");
    await page.waitForLoadState("networkidle");

    await page.locator("button:has-text('Thêm nhóm thông số')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Thêm nhóm thông số mới");

    await modal.locator("input#name").fill(testGroupName);
    await modal.locator("input#displayOrder").fill("5");

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/manager/product-specifications/groups") &&
          res.request().method() === "POST"
      ),
      modal.locator(".ant-modal-footer button:has-text('Thêm mới')").click(),
    ]);

    await expect(page.locator(`.ant-card-small:has-text('${testGroupName}')`)).toBeVisible();
  });

  test("3. Thêm thông số kỹ thuật mới vào nhóm vừa tạo", async ({ page }) => {
    await page.goto("/admin/products/1?tab=specs");
    await page.waitForLoadState("networkidle");

    const groupCard = page.locator(`.ant-card-small:has-text('${testGroupName}')`);
    await expect(groupCard).toBeVisible();

    await groupCard.locator("button:has-text('Thêm thông số')").first().click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Thêm thông số kỹ thuật mới");
    await expect(modal).toContainText(testGroupName);

    await modal.locator("input#name").fill("Cổng sạc");
    await modal.locator("textarea#value").fill("USB-C chuẩn Thunderbolt / USB 4");

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/manager/product-specifications") &&
          !res.url().includes("/groups") &&
          res.request().method() === "POST"
      ),
      modal.locator(".ant-modal-footer button:has-text('Thêm mới')").click(),
    ]);

    await expect(groupCard.locator(".ant-table")).toContainText("Cổng sạc");
    await expect(groupCard.locator(".ant-table")).toContainText("USB-C chuẩn Thunderbolt / USB 4");
  });

  test("4. Chỉnh sửa thông số kỹ thuật trong nhóm", async ({ page }) => {
    await page.goto("/admin/products/1?tab=specs");
    await page.waitForLoadState("networkidle");

    const groupCard = page.locator(`.ant-card-small:has-text('${testGroupName}')`);
    const specRow = groupCard.locator(".ant-table-row:has-text('Cổng sạc')");
    await specRow.locator("button[aria-label='Sửa thông số']").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Chỉnh sửa thông số kỹ thuật");

    await modal.locator("textarea#value").fill("USB-C chuẩn Thunderbolt 4 (40Gbps)");

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/manager/product-specifications") &&
          !res.url().includes("/groups") &&
          res.request().method() === "PUT"
      ),
      modal.locator(".ant-modal-footer button:has-text('Cập nhật')").click(),
    ]);

    await expect(groupCard.locator(".ant-table")).toContainText("USB-C chuẩn Thunderbolt 4 (40Gbps)");
  });

  test("5. Xóa thông số kỹ thuật và xóa nhóm thông số", async ({ page }) => {
    await page.goto("/admin/products/1?tab=specs");
    await page.waitForLoadState("networkidle");

    const groupCard = page.locator(`.ant-card-small:has-text('${testGroupName}')`);
    const specRow = groupCard.locator(".ant-table-row:has-text('Cổng sạc')");
    await specRow.locator("button[aria-label='Xóa thông số']").click();

    await page.waitForSelector(".ant-popconfirm:not(.ant-popconfirm-hidden)");
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/manager/product-specifications") &&
          !res.url().includes("/groups") &&
          res.request().method() === "DELETE"
      ),
      page.locator(".ant-popconfirm .ant-btn-dangerous, .ant-popconfirm button:has-text('Xóa')").click(),
    ]);

    await expect(groupCard.locator(".ant-table")).not.toContainText("USB-C chuẩn Thunderbolt 4 (40Gbps)");

    await groupCard.locator("button[aria-label='Xóa nhóm']").click();

    await page.waitForSelector(".ant-popconfirm:not(.ant-popconfirm-hidden)");
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/manager/product-specifications/groups") &&
          res.request().method() === "DELETE"
      ),
      page.locator(".ant-popconfirm .ant-btn-dangerous, .ant-popconfirm button:has-text('Xóa')").click(),
    ]);

    await expect(page.locator(`.ant-card-small:has-text('${testGroupName}')`)).toHaveCount(0);
  });

  test("6. Kiểm tra giao diện Storefront hiển thị nhóm thông số kỹ thuật phân cấp chuẩn chỉ", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const specContainer = page.locator("[data-testid='product-specifications-container']");
    await expect(specContainer).toBeVisible();
    await expect(specContainer).toContainText("Chi tiết cấu hình");
    await expect(specContainer.locator("[data-testid='spec-group-Hiệu năng']")).toBeVisible();
    await expect(specContainer.locator("[data-testid='spec-group-Cấu hình']")).toBeVisible();
  });
});
