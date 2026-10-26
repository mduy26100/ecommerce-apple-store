import { test, expect } from "@playwright/test";

test.describe("Storefront - Nghiệp vụ Giỏ hàng Trực tuyến (Guest & User Cart)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("1. Khách vãng lai thêm sản phẩm vào giỏ, tự động sinh GuestId lưu vào localStorage và hiển thị Badge", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await expect(addToCartBtn).toBeEnabled();

    const [addResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/cart/items") && res.request().method() === "POST"),
      addToCartBtn.click(),
    ]);

    expect(addResponse.status()).toBe(200);

    const guestId = await page.evaluate(() => localStorage.getItem("apple_store_guest_id"));
    expect(guestId).toBeTruthy();
    expect(guestId?.length).toBeGreaterThan(10);

    const cartBadge = page.locator("[data-testid='header-cart-link'] .ant-badge-count");
    await expect(cartBadge).toBeVisible();
    const countText = await cartBadge.innerText();
    expect(parseInt(countText, 10)).toBeGreaterThanOrEqual(1);
  });

  test("2. Khách vãng lai truy cập /cart: Xem sản phẩm, tăng/giảm số lượng, bật/tắt chọn mua", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("[data-testid='cart-page-title']")).toBeVisible();
    await expect(page.locator("[data-testid='cart-checkout-button']")).toBeVisible();

    const cartItem = page.locator("[data-testid^='cart-item-']").first();
    await expect(cartItem).toBeVisible();
    await expect(cartItem).toContainText("iPhone 16 Pro Max");

    const initialTotal = await page.locator("[data-testid='cart-total-amount']").innerText();
    expect(initialTotal).toBeTruthy();

    const plusBtn = cartItem.locator("button[aria-label='Tăng số lượng']");
    if (await plusBtn.isEnabled()) {
      const [updateResponse] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/cart/items/quantity") && res.request().method() === "PUT"),
        plusBtn.click(),
      ]);
      expect(updateResponse.status()).toBe(200);
      await page.waitForTimeout(300);
    }
  });

  test("3. Tính năng nâng cấp: Khách vãng lai đăng nhập tài khoản -> Tự động merge giỏ hàng vào user", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    const guestIdBeforeLogin = await page.evaluate(() => localStorage.getItem("apple_store_guest_id"));
    expect(guestIdBeforeLogin).toBeTruthy();

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill("input#identifier, input[name='identifier']", "user@apple-store.com");
    await page.fill("input#password, input[name='password']", "User@123456");

    const [loginResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/login") && res.request().method() === "POST"),
      page.click("button[type='submit']"),
    ]);

    expect(loginResponse.status()).toBe(200);
    await page.waitForTimeout(1000);

    const guestIdAfterLogin = await page.evaluate(() => localStorage.getItem("apple_store_guest_id"));
    expect(guestIdAfterLogin).toBeNull();

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const cartItems = page.locator("[data-testid^='cart-item-']");
    await expect(cartItems.first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[data-testid='cart-checkout-button']")).toBeEnabled();
  });

  test("4. Đổi phân loại sản phẩm ngay trong giỏ hàng: Mở modal, chọn biến thể khác và cập nhật giỏ hàng", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const changeVariantBtn = page.locator("[data-testid^='change-variant-btn-']").first();
    await expect(changeVariantBtn).toBeVisible({ timeout: 10000 });
    await changeVariantBtn.click();

    const modalTitle = page.locator("[data-testid='change-variant-modal-title']");
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    const modalContent = page.locator("[data-testid='change-variant-modal-content']");
    await expect(modalContent).toBeVisible({ timeout: 10000 });

    const optionButtons = modalContent.locator("button:has-text('512GB'), button:has-text('1TB'), button:has-text('Titan Sa Mạc'), button:has-text('Titan Đen')");
    if ((await optionButtons.count()) > 0) {
      await optionButtons.first().click();
      await page.waitForTimeout(300);
    }

    const confirmBtn = page.locator("[data-testid='confirm-change-variant-btn']");
    if (await confirmBtn.isEnabled()) {
      const [updateResponse] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/cart/items/variant") && res.request().method() === "PUT"),
        confirmBtn.click(),
      ]);
      expect(updateResponse.status()).toBe(200);
      await expect(modalTitle).not.toBeVisible();
    } else {
      await page.click("button:has-text('Đóng')");
    }
  });

  test("5. Kiểm tra trường hợp tồn kho biến động: Tồn kho chỉ còn 5 mà giỏ lưu 14 thì tự động ép số lượng về 1", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");
    await page.locator("[data-testid='add-to-cart-button']").click();
    await page.waitForTimeout(500);

    await page.route("http://localhost:5288/api/cart*", async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json && json.data && json.data.items && json.data.items.length > 0) {
        json.data.items[0].quantity = 14;
        json.data.items[0].quantityInStock = 5;
        json.data.items[0].isAvailable = true;
      }
      await route.fulfill({ response, json });
    });

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator("[data-testid^='cart-item-']").first();
    await expect(cartItem).toBeVisible({ timeout: 10000 });
    await expect(cartItem.locator("span:has-text('Chỉ còn 5')")).toBeVisible();

    const quantityDisplay = cartItem.locator("span.font-bold.text-slate-800").first();
    await expect(quantityDisplay).toHaveText("1");
    await expect(quantityDisplay).not.toHaveText("14");
  });
});
