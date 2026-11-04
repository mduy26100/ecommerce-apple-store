import { test, expect } from "@playwright/test";

test.describe.serial("Admin - Quản Lý Sản Phẩm (Products Page Flow & Full Detail Page)", () => {
  let createdProductId = 0;
  let testName = "";
  let updatedTestName = "";
  let testSlug = "";

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

  test("1. Hiển thị danh sách sản phẩm và các trường bộ lọc", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Sản phẩm/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("button:has-text('Thêm sản phẩm')")).toBeVisible();
    await expect(page.locator("input[placeholder*='Tìm theo tên']")).toBeVisible();
  });

  test("2. Kiểm tra trang thêm mới và các ràng buộc validation", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm sản phẩm')");
    await page.waitForURL((url) => url.pathname.includes("/admin/products/new"));

    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Thêm Sản Phẩm Mới/i);

    await page.click("button:has-text('Tạo sản phẩm mới')");

    const errors = page.locator(".ant-form-item-explain-error");
    await expect(errors.first()).toBeVisible();
    await expect(page.locator("body")).toContainText("Vui lòng nhập tên sản phẩm!");
    await expect(page.locator("body")).toContainText("Vui lòng chọn danh mục sản phẩm!");

    await page.fill("input#slug", "SLUG CHUA CHU HOA");
    await page.click("button:has-text('Tạo sản phẩm mới')");
    await expect(page.locator("body")).toContainText("Đường dẫn chỉ chứa chữ thường, số và dấu gạch nối (-)");
  });

  test("3. Tạo sản phẩm mới trên Page riêng và tự động chuyển đến trang chi tiết", async ({ page }) => {
    const timestamp = Date.now();
    testName = `PW iPhone 16 Pro ${timestamp}`;
    testSlug = `pw-iphone-16-pro-${timestamp}`;

    await page.goto("/admin/products/new");
    await page.waitForLoadState("networkidle");

    await page.fill("input#name", testName);

    const slugValue = await page.inputValue("input#slug");
    expect(slugValue.length).toBeGreaterThan(0);
    await page.fill("input#slug", testSlug);

    await page.locator("input#categoryId, .ant-select-selector:has(#categoryId)").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    const firstCategory = page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first();
    await firstCategory.click();

    await page.fill("input#modelCode", "A3106-PW");
    await page.fill("input#warrantyMonths", "24");
    await page.fill("textarea#shortDescription", "Điện thoại Apple thử nghiệm tự động Playwright");
    await page.fill("textarea#description", "Mô tả chi tiết tính năng sản phẩm test Playwright");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click("button:has-text('Tạo sản phẩm mới')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    const json = await response.json();
    createdProductId = json.data?.id || json.id;
    expect(createdProductId).toBeGreaterThan(0);

    await page.waitForURL((url) => url.pathname.includes(`/admin/products/${createdProductId}`));
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1").first()).toContainText(testName);
    await expect(page.locator("body")).toContainText("A3106-PW");
    await expect(page.locator("body")).toContainText("Đang kinh doanh");
  });

  test("4. Kiểm tra bố cục trang chi tiết sản phẩm và chuyển các Tab cấu hình", async ({ page }) => {
    expect(createdProductId).toBeGreaterThan(0);
    await page.goto(`/admin/products/${createdProductId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toContainText("Khoảng giá bán");
    await expect(page.locator("body")).toContainText("Số phiên bản");
    await expect(page.locator("body")).toContainText("Tổng tồn kho");
    await expect(page.locator("body")).toContainText("24 tháng");

    await page.setViewportSize({ width: 1280, height: 800 });
    const tabs = page.locator("button[role='tab']");
    await expect(tabs.filter({ hasText: "Thông tin chung" })).toBeVisible();
    await expect(tabs.filter({ hasText: "Phiên bản & Tồn kho" })).toBeVisible();
    await expect(tabs.filter({ hasText: "Hình ảnh theo màu" })).toBeVisible();
    await expect(tabs.filter({ hasText: "Thuộc tính tùy chọn" })).toBeVisible();
    await expect(tabs.filter({ hasText: "Thông số kỹ thuật" })).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(tabs.first()).toBeHidden();
    await expect(page.locator(".ant-select").first()).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });

    await tabs.filter({ hasText: "Phiên bản & Tồn kho" }).click();
    await expect(page.url()).toContain("tab=variants");
    await expect(page.locator("button:has-text('Thêm phiên bản mới')")).toBeVisible();

    await tabs.filter({ hasText: "Thông số kỹ thuật" }).click();
    await expect(page.url()).toContain("tab=specs");

    await tabs.filter({ hasText: "Thông tin chung" }).click();
    await expect(page.url()).toContain("tab=general");
    await expect(page.locator("input#name")).toHaveValue(testName);
  });

  test("5. Chỉnh sửa thông tin sản phẩm trực tiếp trên Page chi tiết", async ({ page }) => {
    expect(createdProductId).toBeGreaterThan(0);
    updatedTestName = `${testName} Max Edition`;

    await page.goto(`/admin/products/${createdProductId}`);
    await page.waitForLoadState("networkidle");

    await page.fill("input#name", updatedTestName);
    await page.fill("input#warrantyMonths", "36");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/api/manager/products/${createdProductId}`) &&
          res.request().method() === "PUT"
      ),
      page.click("button:has-text('Lưu thay đổi sản phẩm')"),
    ]);

    expect(response.status()).toBeLessThan(400);

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1").first()).toContainText(updatedTestName);
    await expect(page.locator("input#name")).toHaveValue(updatedTestName);
    await expect(page.locator("body")).toContainText("36 tháng");
  });

  test("6. Thêm phiên bản mới cho sản phẩm trên Tab Phiên bản & Tồn kho", async ({ page }) => {
    expect(createdProductId).toBeGreaterThan(0);
    const sku = `SKU-PW-${Date.now()}`;

    await page.goto(`/admin/products/${createdProductId}?tab=variants`);
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm phiên bản mới')");

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#sku", sku);
    await page.fill("input#variantName", "Titan Sa Mạc 256GB");
    await page.fill("input#price", "29990000");
    await page.fill("input#compareAtPrice", "31990000");
    await page.fill("input#quantityInStock", "50");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/manager/product-variants") &&
          res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu'), .ant-modal button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();

    await expect(page.locator(".ant-table")).toContainText(sku);
    await expect(page.locator(".ant-table")).toContainText("Titan Sa Mạc 256GB");
  });

  test("7. Điều hướng từ danh sách sản phẩm đến đúng trang chi tiết qua click row hoặc nút sửa", async ({ page }) => {
    expect(createdProductId).toBeGreaterThan(0);
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.fill("input[placeholder*='Tìm theo tên']", updatedTestName);
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${updatedTestName}')`).first();
    await expect(row).toBeVisible();

    await row.click();
    await page.waitForURL((url) => url.pathname.includes(`/admin/products/${createdProductId}`));
    await expect(page.locator("h1").first()).toContainText(updatedTestName);
  });

  test("8. Dọn dẹp dữ liệu: Xóa sản phẩm thử nghiệm đảm bảo cơ sở dữ liệu sạch sẽ", async ({ page }) => {
    expect(createdProductId).toBeGreaterThan(0);
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.fill("input[placeholder*='Tìm theo tên']", updatedTestName);
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${updatedTestName}')`).first();
    await expect(row).toBeVisible();

    await row.locator("button[title='Xóa'], button:has(.anticon-delete)").click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/api/manager/products/${createdProductId}`) &&
          res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    expect(response.status()).toBeLessThan(400);

    await page.fill("input[placeholder*='Tìm theo tên']", updatedTestName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).not.toContainText(updatedTestName);
  });
});
