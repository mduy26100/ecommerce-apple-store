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

  test("1. Mở trang quản lý sản phẩm, hiển thị tab Phiên bản và tab Thuộc tính", async ({ page }) => {
    await page.goto("/admin/products/1");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toContainText("iPhone 16 Pro Max");
    await expect(page.locator("button[role='tab']:has-text('Phiên bản'), [role='tab']:has-text('Phiên bản')")).toBeVisible();
    await expect(page.locator("button[role='tab']:has-text('Thuộc tính'), [role='tab']:has-text('Thuộc tính')")).toBeVisible();
  });

  test("2. Kiểm tra tab Thuộc tính & Tùy chọn hiển thị các nhóm động (Màu sắc, Dung lượng)", async ({ page }) => {
    await page.goto("/admin/products/1?tab=options");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toContainText("Cấu hình nhóm thuộc tính động");
    await expect(page.locator("body")).toContainText("Màu sắc");
    await expect(page.locator("body")).toContainText("Dung lượng");
  });

  test("3. Tạo mới biến thể với thuộc tính động, kiểm tra hiển thị trong bảng", async ({ page }) => {
    const uniqueId = Date.now();
    const testSku = `TEST-IP16PM-${uniqueId}`;
    const testValName = `Titan_${uniqueId}`;

    // 1. Tạo một giá trị màu sắc mới để đảm bảo tổ hợp biến thể là duy nhất không trùng lặp
    await page.goto("/admin/products/1?tab=options");
    await page.waitForLoadState("networkidle");

    const addValueBtn = page.locator("button:has-text('Thêm giá trị')").first();
    await addValueBtn.click();
    await page.locator("input[placeholder*='Giá trị']").first().fill(testValName);
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"),
      page.locator("button:has-text('Lưu')").first().click(),
    ]);

    // 2. Chuyển sang tab Biến thể và tạo biến thể mới với giá trị thuộc tính vừa thêm
    await page.goto("/admin/products/1?tab=variants");
    await page.waitForLoadState("networkidle");

    await page.locator("button:has-text('Thêm phiên bản')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#sku", testSku);
    await page.fill("input#variantName", "Bản thử nghiệm Playwright");
    await page.fill("input#price", "35990000");
    await page.fill("input#quantityInStock", "50");

    const optionSelects = modal.locator(".ant-select");
    const optionCount = await optionSelects.count();
    if (optionCount > 0) {
      await optionSelects.first().click();
      await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
      await page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('${testValName}')`).click();
      await page.waitForTimeout(300);

      if (optionCount > 1) {
        await optionSelects.nth(1).click();
        await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
        await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first().click();
        await page.waitForTimeout(300);
      }
    }

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"
      ),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await expect(page.locator(".ant-table")).toContainText(testSku);

    const createdRow = page.locator(`.ant-table-row:has-text('${testSku}')`);
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
    await expect(page.locator(".ant-table")).toContainText(updatedSku);

    const updatedRow = page.locator(`.ant-table-row:has-text('${updatedSku}')`);
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
    await expect(page.locator(".ant-table")).not.toContainText(updatedSku);
  });

  test("4. Chỉnh sửa nhóm thuộc tính và giá trị thuộc tính với ColorPicker & mã hex", async ({ page }) => {
    await page.goto("/admin/products/1?tab=options");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toContainText("Cấu hình nhóm thuộc tính động");

    const editOptionBtn = page.locator("button[title='Đổi tên nhóm thuộc tính']").first();
    await expect(editOptionBtn).toBeVisible();

    const addValueBtn = page.locator("button:has-text('Thêm giá trị')").first();
    await addValueBtn.click();

    const testValName = `TestColor-${Date.now()}`;
    await page.locator("input[placeholder*='Giá trị']").first().fill(testValName);

    const colorPickerTrigger = page.locator(".ant-color-picker-trigger").first();
    await expect(colorPickerTrigger).toBeVisible();

    await page.locator("input[placeholder*='Mã màu']").first().fill("#22c55e");

    const [createValRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"
      ),
      page.locator("button:has-text('Lưu')").first().click(),
    ]);
    expect(createValRes.status()).toBeLessThan(400);

    const valTag = page.locator(`.group:has-text('${testValName}')`);
    await expect(valTag).toBeVisible();

    const editValBtn = valTag.locator("button[title='Chỉnh sửa giá trị']");
    await editValBtn.click();

    const updatedValName = `${testValName}-Edited`;
    const editInput = page.locator("input[placeholder='Giá trị']").first();
    await editInput.fill(updatedValName);

    const [updateValRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "PUT"
      ),
      page.locator("button[title='Lưu']").first().click(),
    ]);
    expect(updateValRes.status()).toBeLessThan(400);

    const updatedTag = page.locator(`.group:has-text('${updatedValName}')`);
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
    await expect(page.locator("body")).not.toContainText(updatedValName);
  });
});
