import { test, expect } from "@playwright/test";

test.describe("Admin - Toàn diện chu trình Quản trị (Full Regression Flow)", () => {
  test.describe.configure({ mode: "serial" });
  const uniqueId = Date.now();
  const testCategoryName = `Danh mục E2E ${uniqueId}`;
  const testCategorySlug = `danh-muc-e2e-${uniqueId}`;
  const testColorName = `Titan Tím ${uniqueId}`;
  const testColorCode = `TITAN_PURPLE_${uniqueId}`;
  const testColorHex = "#5C4B77";
  const testStorageName = `2TB_${uniqueId}`;
  const testStorageValue = "2048";
  const testProductName = `iPhone 16 Ultra E2E ${uniqueId}`;
  const testProductSlug = `iphone-16-ultra-e2e-${uniqueId}`;
  const testSku = `IP16U-2TB-${uniqueId}`;
  const testCustomerName = `Khách hàng VIP ${uniqueId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    }
  });

  test("1. Tạo Danh mục mới thành công", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm danh mục')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", testCategoryName);
    await page.fill("input#slug", testCategorySlug);
    await page.fill("input#displayOrder", "1");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/categories") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='danh mục']", testCategoryName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testCategoryName);
  });

  test("2. Tạo Màu sắc mới thành công", async ({ page }) => {
    await page.goto("/admin/colors");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm màu sắc')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", testColorName);
    await page.fill("input#code", testColorCode);
    await page.fill("input#hexCode", testColorHex);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/colors") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='màu']", testColorName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testColorName);
  });

  test("3. Tạo Tùy chọn Dung lượng mới thành công", async ({ page }) => {
    await page.goto("/admin/storage-options");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm dung lượng')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#name", testStorageName);
    await page.fill("input#capacityValue", testStorageValue);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/storage-options") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='đơn vị']", testStorageName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testStorageName);
  });

  test("4. Tạo Sản phẩm mới liên kết danh mục", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm sản phẩm')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    const option = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('${testCategoryName}')`);
    if (await option.count() > 0) {
      await option.click();
    } else {
      await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();
    }

    await page.fill("input#name", testProductName);
    await page.fill("input#slug", testProductSlug);
    await page.fill("input#modelCode", "A3999");
    await page.fill("input#warrantyMonths", "24");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testProductName);
  });

  test("5. Thêm Biến thể cho sản phẩm", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#sku", testSku);
    await page.fill("input#variantName", "2TB - Titan Tím");
    await page.fill("input#price", "49990000");
    await page.fill("input#quantityInStock", "50");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(modal).not.toBeVisible();
    await expect(drawer.locator(".ant-table")).toContainText(testSku);
  });

  test("6. Thêm Thông số kỹ thuật cho sản phẩm", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await drawer.locator(".ant-tabs-tab:has-text('Thông số')").click();

    await drawer.locator("button:has-text('Thêm thông số')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await modal.locator("input#groupName").fill("Màn hình");
    await modal.locator("input#name").fill("Công nghệ");
    await modal.locator("textarea#value").fill("OLED Tandem 120Hz ProMotion");
    await modal.locator("input#displayOrder").fill("1");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-specifications") && res.request().method() === "POST"
      ),
      modal.locator(".ant-modal-footer button:has-text('Thêm mới')").click(),
    ]);

    await expect(modal).not.toBeVisible();
    await expect(drawer).toContainText("OLED Tandem 120Hz ProMotion");
  });

  test("7. Tạo Đơn hàng và kiểm tra hiển thị trong Quản lý đơn hàng", async ({ page, request }) => {
    const createRes = await request.post("http://localhost:5288/api/manager/orders", {
      data: {
        userId: 1,
        recipientName: testCustomerName,
        recipientPhone: "0909123456",
        shippingAddressLine: "456 Nam Kỳ Khởi Nghĩa",
        shippingDistrict: "Quận 3",
        shippingProvince: "Hồ Chí Minh",
        customerNote: "Giao hỏa tốc",
        paymentMethod: "VNPAY",
        shippingFee: 50000,
        items: [
          {
            productName: testProductName,
            sku: testSku,
            colorName: testColorName,
            storageName: testStorageName,
            unitPrice: 49990000,
            quantity: 1,
          },
        ],
      },
    });

    expect(createRes.status()).toBeLessThan(400);

    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    const orderRow = page.locator(`.ant-table-row:has-text('${testCustomerName}')`);
    await expect(orderRow).toBeVisible();

    await orderRow.locator("button[aria-label='Xem chi tiết đơn hàng']").click();
    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Chi tiết đơn hàng");
    await expect(drawer).toContainText(testProductName);
    await expect(drawer).toContainText(testSku);
  });
});
