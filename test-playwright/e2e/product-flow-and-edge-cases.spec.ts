import { test, expect } from "@playwright/test";

test.describe("E2E - Luồng Sản phẩm & Kiểm thử biên người dùng (Product Flow & Edge Cases)", () => {
  const timestamp = Date.now();
  const testProductName = `iPhone 16 Pro E2E ${timestamp}`;
  const testProductSlug = `iphone-16-pro-e2e-${timestamp}`;
  const skuVariant1 = `IP16PE2E-DESERT-256G-${timestamp}`;
  const skuVariant2 = `IP16PE2E-NAT-512G-${timestamp}`;

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

  test("1. Bắt lỗi validate khi người dùng nhập sai, bỏ trống hoặc nhập ký tự dị thường khi tạo sản phẩm", async ({ page, request }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm sản phẩm')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Lưu')");
    const errors = page.locator(".ant-form-item-explain-error");
    await expect(errors.first()).toBeVisible();

    await page.fill("input#name", "     ");
    await page.fill("input#slug", "     ");
    await page.click(".ant-modal-footer button:has-text('Lưu')");
    await expect(errors.first()).toBeVisible();

    await page.fill("input#name", "iPhone Test");
    await page.fill("input#slug", "iphone-test@#!$$%");
    await page.click(".ant-modal-footer button:has-text('Lưu')");
    await expect(page.locator(".ant-form-item-explain-error:has-text('Đường dẫn chỉ chứa chữ thường')")).toBeVisible();

    await page.click(".ant-modal-footer button:has-text('Hủy')");
    await expect(modal).not.toBeVisible();

    const nonExistentCategoryRes = await request.post("http://localhost:5288/api/manager/products", {
      data: {
        categoryId: 999999,
        name: "Test Cat Not Found",
        slug: "test-cat-not-found",
        warrantyMonths: 12,
        isActive: true,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(nonExistentCategoryRes.status()).toBe(404);

    const badPayloadResponse = await request.post("http://localhost:5288/api/manager/products", {
      data: {
        categoryId: 1,
        name: "   ",
        slug: "invalid_slug_with_special_characters@#$",
        warrantyMonths: -10,
        isActive: true,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(badPayloadResponse.status()).toBe(400);
    const jsonRes = await badPayloadResponse.json();
    expect(jsonRes.error).toBeTruthy();
  });

  test("2. Tạo sản phẩm thành công với danh mục có sẵn và kiểm tra xuất hiện trong bảng", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm sản phẩm')");
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.locator(".ant-modal input#categoryId").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    const firstCategory = page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option").first();
    await firstCategory.click();

    await page.fill("input#name", testProductName);
    await page.fill("input#slug", testProductSlug);
    await page.fill("input#modelCode", "A3290");
    await page.fill("input#warrantyMonths", "12");
    await page.fill("textarea#shortDescription", "Sản phẩm thử nghiệm tự động chuẩn hóa");
    await page.fill("textarea#description", "Mô tả chi tiết cấu hình và tính năng sản phẩm");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/products") && res.request().method() === "POST"),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();

    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".ant-table")).toContainText(testProductName);
  });

  test("3. Quản lý thuộc tính động: chặn tên rỗng, chặn trùng tên nhóm, chặn mã màu dị thường và tạo nhóm chuẩn", async ({ page, request }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`).first();
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator(".ant-tabs-tab:has-text('Thuộc tính & Tùy chọn')").click();
    await expect(drawer).toContainText("Cấu hình nhóm thuộc tính động");

    await drawer.locator("button:has-text('Thêm nhóm thuộc tính'), button:has-text('Tạo nhóm thuộc tính đầu tiên')").first().click();
    await drawer.locator("input[placeholder*='Tên thuộc tính']").fill("Màu sắc");

    const [createColorOptionRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options") && res.request().method() === "POST"),
      drawer.locator("button:has-text('Lưu')").first().click(),
    ]);
    expect(createColorOptionRes.status()).toBeLessThan(400);
    const colorOptData = await createColorOptionRes.json();
    const colorOptId = colorOptData.data;

    await drawer.locator("button:has-text('Thêm nhóm thuộc tính')").click();
    await drawer.locator("input[placeholder*='Tên thuộc tính']").fill("Màu sắc");
    const [dupColorOptionRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options") && res.request().method() === "POST"),
      drawer.locator("button:has-text('Lưu')").first().click(),
    ]);
    expect(dupColorOptionRes.status()).toBe(409);
    await drawer.locator("button:has-text('Hủy')").first().click();

    const badColorHexRes = await request.post("http://localhost:5288/api/manager/product-options/values", {
      data: {
        optionId: colorOptId,
        value: "Màu Lỗi",
        colorHexCode: "khong_phai_hex_code",
      },
    });
    expect(badColorHexRes.status()).toBe(400);

    const colorSection = drawer.locator(".p-4:has-text('Màu sắc')").first();
    await colorSection.locator("button:has-text('Thêm giá trị')").click();
    await colorSection.locator("input[placeholder*='Giá trị']").fill("Titan Sa Mạc");
    await colorSection.locator("input[placeholder*='Mã màu']").fill("#cabaa6");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"),
      colorSection.locator("button:has-text('Lưu')").click(),
    ]);

    await colorSection.locator("button:has-text('Thêm giá trị')").click();
    await colorSection.locator("input[placeholder*='Giá trị']").fill("Titan Sa Mạc");
    const [dupValueRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"),
      colorSection.locator("button:has-text('Lưu')").click(),
    ]);
    expect(dupValueRes.status()).toBe(409);
    await colorSection.locator("button:has-text('Hủy')").click();

    await colorSection.locator("button:has-text('Thêm giá trị')").click();
    await colorSection.locator("input[placeholder*='Giá trị']").fill("Titan Tự Nhiên");
    await colorSection.locator("input[placeholder*='Mã màu']").fill("#9f9b96");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"),
      colorSection.locator("button:has-text('Lưu')").click(),
    ]);

    await drawer.locator("button:has-text('Thêm nhóm thuộc tính')").click();
    await drawer.locator("input[placeholder*='Tên thuộc tính']").fill("Dung lượng");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options") && res.request().method() === "POST"),
      drawer.locator("button:has-text('Lưu')").first().click(),
    ]);

    const storageSection = drawer.locator(".p-4:has-text('Dung lượng')").first();
    await storageSection.locator("button:has-text('Thêm giá trị')").click();
    await storageSection.locator("input[placeholder*='Giá trị']").fill("256GB");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"),
      storageSection.locator("button:has-text('Lưu')").click(),
    ]);

    await storageSection.locator("button:has-text('Thêm giá trị')").click();
    await storageSection.locator("input[placeholder*='Giá trị']").fill("512GB");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-options/values") && res.request().method() === "POST"),
      storageSection.locator("button:has-text('Lưu')").click(),
    ]);

    await expect(colorSection).toContainText("Titan Sa Mạc");
    await expect(colorSection).toContainText("Titan Tự Nhiên");
    await expect(storageSection).toContainText("256GB");
    await expect(storageSection).toContainText("512GB");
  });

  test("4. Quản lý phiên bản biến thể: chặn giá âm, chặn SKU trùng, chặn trùng tổ hợp thuộc tính và tạo 2 biến thể chuẩn", async ({ page, request }) => {
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle");

    await page.fill("input[placeholder*='Tìm theo tên']", testProductName);
    await page.waitForLoadState("networkidle");
    const row = page.locator(`.ant-table-row:has-text('${testProductName}')`).first();
    await row.click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();

    await drawer.locator(".ant-tabs-tab:has-text('Phiên bản & Tồn kho')").click();
    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await page.fill("input#sku", skuVariant1);
    await page.fill("input#variantName", "Titan Sa Mạc - 256GB");
    await page.fill("input#price", "34990000");
    await page.fill("input#quantityInStock", "50");

    const colorSelect = modal.locator(".ant-select").first();
    await colorSelect.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Titan Sa Mạc')").click();

    const storageSelect = modal.locator(".ant-select").nth(1);
    await storageSelect.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('256GB')").click();

    const [createVar1Res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);
    expect(createVar1Res.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();
    await expect(drawer.locator(".ant-table")).toContainText(skuVariant1);

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    await expect(modal).toBeVisible();
    await page.fill("input#sku", skuVariant1);
    await page.fill("input#variantName", "Trùng SKU");
    await page.fill("input#price", "34990000");
    await page.fill("input#quantityInStock", "10");

    const colorSelectDup = modal.locator(".ant-select").first();
    await colorSelectDup.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Titan Tự Nhiên')").click();

    const storageSelectDup = modal.locator(".ant-select").nth(1);
    await storageSelectDup.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('512GB')").click();

    const [dupSkuRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);
    expect(dupSkuRes.status()).toBe(409);

    await page.fill("input#sku", `ANOTHER-SKU-${timestamp}`);
    const colorSelectComb = modal.locator(".ant-select").first();
    await colorSelectComb.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Titan Sa Mạc')").click();

    const storageSelectComb = modal.locator(".ant-select").nth(1);
    await storageSelectComb.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('256GB')").click();

    const [dupCombRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);
    expect(dupCombRes.status()).toBe(409);
    await page.click(".ant-modal-footer button:has-text('Đóng')");
    await expect(modal).not.toBeVisible();

    await drawer.locator("button:has-text('Thêm phiên bản')").click();
    await expect(modal).toBeVisible();
    await page.fill("input#sku", skuVariant2);
    await page.fill("input#variantName", "Titan Tự Nhiên - 512GB");
    await page.fill("input#price", "40990000");
    await page.fill("input#quantityInStock", "20");

    const colorSelect2 = modal.locator(".ant-select").first();
    await colorSelect2.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Titan Tự Nhiên')").click();

    const storageSelect2 = modal.locator(".ant-select").nth(1);
    await storageSelect2.click();
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('512GB')").click();

    const [createVar2Res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/manager/product-variants") && res.request().method() === "POST"),
      page.click(".ant-modal-footer button:has-text('Lưu')"),
    ]);
    expect(createVar2Res.status()).toBeLessThan(400);
    await expect(modal).not.toBeVisible();

    await expect(drawer.locator(".ant-table")).toContainText(skuVariant1);
    await expect(drawer.locator(".ant-table")).toContainText(skuVariant2);
  });

  test("5. Kiểm thử Storefront Public: Xem chi tiết sản phẩm, kiểm tra bố cục thanh tóm tắt, tương tác chuyển đổi biến thể", async ({ page }) => {
    await page.goto(`/products/${testProductSlug}`);
    await page.waitForLoadState("networkidle");

    const title = page.locator("h1");
    await expect(title).toBeVisible();
    await expect(title).toContainText(testProductName);

    const summaryBar = page.locator(".variant-summary-bar");
    await expect(summaryBar).toBeVisible();

    const colorGroup = page.locator(".space-y-4:has-text('MÀU SẮC')");
    await expect(colorGroup).toBeVisible();
    await expect(colorGroup).toContainText("Titan Sa Mạc");
    await expect(colorGroup).toContainText("Titan Tự Nhiên");

    const storageGroup = page.locator(".space-y-4:has-text('DUNG LƯỢNG')");
    await expect(storageGroup).toBeVisible();
    await expect(storageGroup).toContainText("256GB");
    await expect(storageGroup).toContainText("512GB");

    const btnDesert = colorGroup.locator("button:has-text('Titan Sa Mạc')");
    const btn256 = storageGroup.locator("button:has-text('256GB')");
    await btnDesert.click();
    await btn256.click();

    await expect(page.locator("body")).toContainText("34.990.000");
    await expect(page.locator("body")).toContainText(skuVariant1);
    await expect(summaryBar).toContainText("50");

    const btnNatural = colorGroup.locator("button:has-text('Titan Tự Nhiên')");
    const btn512 = storageGroup.locator("button:has-text('512GB')");
    await btnNatural.click();
    await btn512.click();

    await expect(page.locator("body")).toContainText("40.990.000");
    await expect(page.locator("body")).toContainText(skuVariant2);
    await expect(summaryBar).toContainText("20");

    const addToCartBtn = page.locator("button:has-text('Thêm vào giỏ')");
    const buyNowBtn = page.locator("button:has-text('Mua ngay')");
    await expect(addToCartBtn).toBeEnabled();
    await expect(buyNowBtn).toBeEnabled();

    await addToCartBtn.click();
    await expect(page.locator(".ant-message")).toBeVisible();
  });
});
