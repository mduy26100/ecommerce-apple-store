import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Ảnh Biến thể (Variant Images & Gallery)", () => {
  const uniqueId = Date.now();
  const testProductName = `iPhone 16 Pro Max Gallery ${uniqueId}`;
  const testProductSlug = `iphone-16-pro-max-gallery-${uniqueId}`;
  const testSku = `GALLERY-SKU-${uniqueId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");
  });

  test("Khởi tạo sản phẩm và phiên bản phục vụ kiểm thử thư viện ảnh", async ({ page }) => {
    await page.click("button:has-text('Thêm sản phẩm')");
    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();

    await page.fill("input#name", testProductName);
    await page.fill("input#slug", testProductSlug);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(page.locator(".ant-table")).toContainText(testProductName);

    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    await page.fill("input#sku", testSku);
    await page.fill("input#price", "34990000");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    await expect(drawer.locator(".ant-table")).toContainText(testSku);
  });

  test("Mở hộp thoại bộ sưu tập ảnh và thêm ảnh mới thành công", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    const variantRow = drawer.locator(`.ant-table-row:has-text('${testSku}')`);
    await variantRow.locator("button[title='Bộ sưu tập ảnh'], button:has(.anticon-picture)").click();

    const imagesModal = page.locator(".ant-modal");
    await expect(imagesModal).toBeVisible();
    await expect(imagesModal).toContainText("Bộ sưu tập hình ảnh");

    const img1Url = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5";
    await imagesModal.locator("input#imageUrl").fill(img1Url);
    await imagesModal.locator("input#altText").fill("Ảnh mặt trước");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/variant-images") && res.request().method() === "POST"
      ),
      imagesModal.locator("button:has-text('Thêm ảnh vào bộ sưu tập')").click(),
    ]);

    await expect(imagesModal.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible();
  });

  test("Thêm ảnh thứ hai và chuyển đổi ảnh đại diện chính", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    const variantRow = drawer.locator(`.ant-table-row:has-text('${testSku}')`);
    await variantRow.locator("button[title='Bộ sưu tập ảnh'], button:has(.anticon-picture)").click();

    const imagesModal = page.locator(".ant-modal");
    await expect(imagesModal).toBeVisible();

    const img2Url = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab";
    await imagesModal.locator("input#imageUrl").fill(img2Url);
    await imagesModal.locator("input#altText").fill("Ảnh mặt lưng");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/variant-images") && res.request().method() === "POST"
      ),
      imagesModal.locator("button:has-text('Thêm ảnh vào bộ sưu tập')").click(),
    ]);

    const setPrimaryBtn = imagesModal.locator("button:has-text('Đặt chính')").first();
    await expect(setPrimaryBtn).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/primary") && (res.request().method() === "PUT" || res.request().method() === "PATCH")
      ),
      setPrimaryBtn.click(),
    ]);

    await expect(imagesModal.locator(".ant-tag:has-text('Ảnh chính')")).toBeVisible();
  });

  test("Thực hiện xóa ảnh khỏi bộ sưu tập thành công", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`);
    await row.locator("button[title='Quản lý phiên bản'], button:has(.anticon-appstore)").click();

    const drawer = page.locator(".ant-drawer");
    const variantRow = drawer.locator(`.ant-table-row:has-text('${testSku}')`);
    await variantRow.locator("button[title='Bộ sưu tập ảnh'], button:has(.anticon-picture)").click();

    const imagesModal = page.locator(".ant-modal");
    await expect(imagesModal).toBeVisible();

    await expect(imagesModal.locator(".relative.group").first()).toBeVisible();
    const initialCards = await imagesModal.locator(".relative.group").count();
    expect(initialCards).toBeGreaterThan(0);

    const firstDeleteBtn = imagesModal.locator(".relative.group button:has(.anticon-delete)").first();
    await firstDeleteBtn.click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/variant-images") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    await expect(imagesModal.locator(".relative.group")).toHaveCount(initialCards - 1);
  });
});
