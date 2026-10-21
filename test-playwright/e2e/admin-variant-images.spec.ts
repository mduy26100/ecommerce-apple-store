import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Ảnh Biến thể (Variant Images, Batch Upload & Free Cropper)", () => {
  const sampleImagePath = "C:/Users/Admin/Documents/KryzoSoft/images/opengraph-image.png";

  test("Quy trình kiểm thử toàn diện Quản lý Ảnh Biến thể: Tạo mới, Cắt ảnh tự do, Tải nhiều ảnh batch, Chuẩn hóa thứ tự 1-n và Xóa ảnh", async ({ page }) => {
    const uniqueId = Date.now();
    const testProductName = `iPhone 16 Pro Max Gallery ${uniqueId}`;
    const testProductSlug = `iphone-16-pro-max-gallery-${uniqueId}`;
    const testSku = `GALLERY-SKU-${uniqueId}`;

    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

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

    const variantRow = drawer.locator(`.ant-table-row:has-text('${testSku}')`);
    await expect(variantRow).toBeVisible({ timeout: 10000 });
    await variantRow.click();

    const imagesModal = page.locator(".ant-modal").first();
    await expect(imagesModal).toBeVisible({ timeout: 10000 });
    await expect(imagesModal).toContainText("Bộ sưu tập hình ảnh");

    const fileInput = imagesModal.locator("input#variantImageUploadInput");
    await fileInput.setInputFiles(sampleImagePath);

    const cropBtn = imagesModal.locator("button#btnCropVariantImage");
    await expect(cropBtn).toBeVisible({ timeout: 10000 });
    await cropBtn.click();

    const cropperModal = page.locator(".ant-modal:has-text('Cắt ảnh sản phẩm (Tự do ngang dọc)')");
    await expect(cropperModal).toBeVisible({ timeout: 10000 });

    const confirmCropBtn = cropperModal.locator(".ant-modal-footer button:has-text('Xác nhận')");
    await expect(confirmCropBtn).toBeVisible({ timeout: 10000 });
    await confirmCropBtn.click();
    await expect(cropperModal).not.toBeVisible({ timeout: 10000 });

    const uploadBtn = imagesModal.locator("button#btnUploadVariantImages");
    await expect(uploadBtn).toBeVisible({ timeout: 10000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/variant-images") && res.request().method() === "POST" && res.status() < 400,
        { timeout: 35000 }
      ),
      uploadBtn.click(),
    ]);

    await expect(imagesModal.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible({ timeout: 10000 });
    await expect(imagesModal.locator(".relative.group .ant-tag:has-text('#1')")).toBeVisible({ timeout: 10000 });

    await fileInput.setInputFiles([sampleImagePath, sampleImagePath]);
    await expect(uploadBtn).toBeVisible({ timeout: 10000 });
    await expect(uploadBtn).toContainText("Tải lên 2 ảnh đã chọn");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/variant-images/batch") && res.request().method() === "POST" && res.status() < 400,
        { timeout: 45000 }
      ),
      uploadBtn.click(),
    ]);

    await expect(imagesModal.locator(".relative.group")).toHaveCount(3, { timeout: 15000 });
    await expect(imagesModal.locator(".relative.group .ant-tag:has-text('#1')")).toBeVisible();
    await expect(imagesModal.locator(".relative.group .ant-tag:has-text('#2')")).toBeVisible();
    await expect(imagesModal.locator(".relative.group .ant-tag:has-text('#3')")).toBeVisible();

    const setPrimaryBtn = imagesModal.locator("button:has-text('Đặt chính')").first();
    await expect(setPrimaryBtn).toBeVisible({ timeout: 10000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/primary") && (res.request().method() === "PUT" || res.request().method() === "PATCH"),
        { timeout: 20000 }
      ),
      setPrimaryBtn.click(),
    ]);

    await expect(imagesModal.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible({ timeout: 10000 });

    const firstDeleteBtn = imagesModal.locator(".relative.group button:has(.anticon-delete)").first();
    await firstDeleteBtn.click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible({ timeout: 10000 });

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/variant-images") && res.request().method() === "DELETE",
        { timeout: 30000 }
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(imagesModal.locator(".relative.group")).toHaveCount(2, { timeout: 10000 });
    await expect(imagesModal.locator(".relative.group .ant-tag:has-text('#1')")).toBeVisible();
    await expect(imagesModal.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible();
  });
});
