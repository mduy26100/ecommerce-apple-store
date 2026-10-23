import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Ảnh Biến thể (Variant Images, Batch Upload & Free Cropper)", () => {
  const sampleImagePath = "C:/Users/Admin/Documents/KryzoSoft/images/opengraph-image.png";

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

  test("Quy trình kiểm thử toàn diện Quản lý Ảnh Biến thể: Tạo mới, Cắt ảnh tự do, Tải nhiều ảnh batch, Chuẩn hóa thứ tự 1-n và Xóa ảnh", async ({ page }) => {
    const uniqueId = Date.now();
    const testProductName = `iPhone 16 Pro Max Gallery ${uniqueId}`;
    const testProductSlug = `iphone-16-pro-max-gallery-${uniqueId}`;
    const testSku = `GALLERY-SKU-${uniqueId}`;

    await page.click("button:has-text('Thêm sản phẩm')");
    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();

    await page.fill("input#name", testProductName);
    await page.fill("input#slug", testProductSlug);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST",
        { timeout: 20000 }
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    const searchInput = page.locator("input[placeholder*='Tìm theo tên']");
    await searchInput.fill(testProductName);
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator(".ant-tag:has-text('phiên bản'), .ant-table-cell:first-child").first().click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible({ timeout: 10000 });

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    await page.fill("input#sku", testSku);
    await page.fill("input#price", "34990000");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST",
        { timeout: 20000 }
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await drawer.locator(".ant-tabs-tab:has-text('Hình ảnh theo màu')").click();
    await expect(drawer.getByText("Quản lý hình ảnh theo màu sắc").first()).toBeVisible({ timeout: 10000 });

    const fileInput = drawer.locator("input#productImageUploadInput");
    await fileInput.setInputFiles(sampleImagePath);

    const cropBtn = drawer.locator("button#btnCropVariantImage");
    await expect(cropBtn).toBeVisible({ timeout: 10000 });
    await cropBtn.click();

    const cropperModal = page.locator(".ant-modal:has-text('Cắt ảnh sản phẩm (Tự do ngang dọc)')");
    await expect(cropperModal).toBeVisible({ timeout: 10000 });

    const confirmCropBtn = cropperModal.locator(".ant-modal-footer button:has-text('Xác nhận')");
    await expect(confirmCropBtn).toBeVisible({ timeout: 10000 });
    await confirmCropBtn.click();
    await expect(cropperModal).not.toBeVisible({ timeout: 10000 });

    const uploadBtn = drawer.locator("button#btnUploadVariantImages");
    await expect(uploadBtn).toBeVisible({ timeout: 10000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-images") && res.request().method() === "POST" && res.status() < 400,
        { timeout: 35000 }
      ),
      uploadBtn.click(),
    ]);

    await expect(drawer.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible({ timeout: 10000 });
    await expect(drawer.locator(".relative.group .ant-tag:has-text('#1')")).toBeVisible({ timeout: 10000 });

    await fileInput.setInputFiles([sampleImagePath, sampleImagePath]);
    await expect(uploadBtn).toBeVisible({ timeout: 10000 });
    await expect(uploadBtn).toContainText("Tải lên 2 ảnh");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-images/batch") && res.request().method() === "POST" && res.status() < 400,
        { timeout: 45000 }
      ),
      uploadBtn.click(),
    ]);

    await expect(drawer.locator(".relative.group")).toHaveCount(3, { timeout: 15000 });
    await expect(drawer.locator(".relative.group .ant-tag:has-text('#1')")).toBeVisible();
    await expect(drawer.locator(".relative.group .ant-tag:has-text('#2')")).toBeVisible();
    await expect(drawer.locator(".relative.group .ant-tag:has-text('#3')")).toBeVisible();

    const setPrimaryBtn = drawer.locator("button:has-text('Đặt chính')").first();
    await expect(setPrimaryBtn).toBeVisible({ timeout: 10000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/primary") && (res.request().method() === "PUT" || res.request().method() === "PATCH"),
        { timeout: 20000 }
      ),
      setPrimaryBtn.click(),
    ]);

    await expect(drawer.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible({ timeout: 10000 });

    const firstDeleteBtn = drawer.locator(".relative.group button:has(.anticon-delete)").first();
    await firstDeleteBtn.click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible({ timeout: 10000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-images") && res.request().method() === "DELETE",
        { timeout: 30000 }
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(drawer.locator(".relative.group")).toHaveCount(2, { timeout: 10000 });
    await expect(drawer.locator(".relative.group .ant-tag:has-text('#1')")).toBeVisible();
    await expect(drawer.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible();
  });
});
