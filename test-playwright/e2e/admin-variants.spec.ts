import { test, expect } from "@playwright/test";

test.describe("Admin - Quản lý Biến thể & Thuộc tính Động (Dynamic Options & Variants CRUD)", () => {
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

  test("1. Mở ngăn kéo quản lý sản phẩm, hiển thị tab Phiên bản và tab Thuộc tính & Tùy chọn", async ({ page }) => {
    await page.fill("input[placeholder*='Tìm theo tên']", "iPhone 16 Pro Max");
    await page.waitForLoadState("networkidle");

    const row = page.locator(".ant-table-row:has-text('iPhone 16 Pro Max')").first();
    await expect(row).toBeVisible();
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("iPhone 16 Pro Max");
    await expect(drawer).toContainText("Phiên bản & Tồn kho");
    await expect(drawer).toContainText("Thuộc tính & Tùy chọn");
  });

  test("2. Kiểm tra tab Thuộc tính & Tùy chọn hiển thị các nhóm động (Màu sắc, Dung lượng)", async ({ page }) => {
    await page.fill("input[placeholder*='Tìm theo tên']", "iPhone 16 Pro Max");
    await page.waitForLoadState("networkidle");

    const row = page.locator(".ant-table-row:has-text('iPhone 16 Pro Max')").first();
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator(".ant-tabs-tab:has-text('Thuộc tính & Tùy chọn')").click();
    await expect(drawer).toContainText("Cấu hình nhóm thuộc tính động");
    await expect(drawer).toContainText("Màu sắc");
    await expect(drawer).toContainText("Dung lượng");
  });

  test("3. Tạo mới biến thể với thuộc tính động, kiểm tra hiển thị trong bảng", async ({ page }) => {
    const testSku = `TEST-IP16PM-${Date.now()}`;

    await page.fill("input[placeholder*='Tìm theo tên']", "iPhone 16 Pro Max");
    await page.waitForLoadState("networkidle");

    const row = page.locator(".ant-table-row:has-text('iPhone 16 Pro Max')").first();
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#sku", testSku);
    await page.fill("input#variantName", "Bản thử nghiệm Playwright");
    await page.fill("input#price", "35990000");
    await page.fill("input#quantityInStock", "50");

    const optionSelects = modal.locator(".ant-select");
    const optionCount = await optionSelects.count();
    for (let i = 0; i < optionCount; i++) {
      await optionSelects.nth(i).click();
      const option = page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first();
      await option.waitFor({ state: "visible" });
      await option.click();
      await page.waitForTimeout(400);
    }

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await expect(drawer.locator(".ant-table")).toContainText(testSku);

    const createdRow = drawer.locator(`.ant-table-row:has-text('${testSku}')`);
    await createdRow.locator("button[title='Chỉnh sửa'], button:has(.anticon-edit)").click();
    await expect(modal).toBeVisible();
    await expect(page.locator("input#sku")).toHaveValue(testSku);

    const updatedSku = `${testSku}-REV`;
    await page.fill("input#sku", updatedSku);

    const [updateResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "PUT"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(updateResponse.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await expect(drawer.locator(".ant-table")).toContainText(updatedSku);

    const updatedRow = drawer.locator(`.ant-table-row:has-text('${updatedSku}')`);
    await updatedRow.locator("button[title='Xóa'], button:has(.anticon-delete)").click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    const [deleteResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);

    expect(deleteResponse.status()).toBeLessThan(400);
    await expect(drawer.locator(".ant-table")).not.toContainText(updatedSku);
  });

  test("4. Chỉnh sửa nhóm thuộc tính và giá trị thuộc tính với ColorPicker & mã hex", async ({ page }) => {
    await page.fill("input[placeholder*='Tìm theo tên']", "iPhone 16 Pro Max");
    await page.waitForLoadState("networkidle");

    const row = page.locator(".ant-table-row:has-text('iPhone 16 Pro Max')").first();
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator(".ant-tabs-tab:has-text('Thuộc tính & Tùy chọn')").click();
    await expect(drawer).toContainText("Cấu hình nhóm thuộc tính động");

    const editOptionBtn = drawer.locator("button[title='Đổi tên nhóm thuộc tính']").first();
    await expect(editOptionBtn).toBeVisible();

    const addValueBtn = drawer.locator("button:has-text('Thêm giá trị')").first();
    await addValueBtn.click();

    const testValName = `TestColor-${Date.now()}`;
    await drawer.locator("input[placeholder*='Giá trị']").first().fill(testValName);

    const colorPickerTrigger = drawer.locator(".ant-color-picker-trigger").first();
    await expect(colorPickerTrigger).toBeVisible();

    await drawer.locator("input[placeholder*='Mã màu']").first().fill("#22c55e");

    const [createValRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"
      ),
      drawer.locator("button:has-text('Lưu')").first().click(),
    ]);
    expect(createValRes.status()).toBeLessThan(400);

    const valTag = drawer.locator(`.group:has-text('${testValName}')`);
    await expect(valTag).toBeVisible();

    const editValBtn = valTag.locator("button[title='Chỉnh sửa giá trị']");
    await editValBtn.click();

    const updatedValName = `${testValName}-Edited`;
    const editInput = drawer.locator("input[placeholder='Giá trị']").first();
    await editInput.fill(updatedValName);

    const [updateValRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "PUT"
      ),
      drawer.locator("button[title='Lưu']").first().click(),
    ]);
    expect(updateValRes.status()).toBeLessThan(400);

    const updatedTag = drawer.locator(`.group:has-text('${updatedValName}')`);
    await expect(updatedTag).toBeVisible();

    const deleteValBtn = updatedTag.locator("button[title='Xóa giá trị']");
    await deleteValBtn.click();

    const popconfirm = page.locator(".ant-popconfirm, .ant-popover");
    await expect(popconfirm).toBeVisible();

    const [deleteValRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "DELETE"
      ),
      popconfirm.locator("button:has-text('Xóa')").click(),
    ]);
    expect(deleteValRes.status()).toBeLessThan(400);
    await expect(drawer).not.toContainText(updatedValName);
  });
});
