import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

test.describe("Background Jobs - Tự động Hủy Đơn hàng Om Lâu & Phục hồi Tồn kho", () => {
  const uniqueId = Date.now();
  const testCustomerName = `Khách Hàng Om ${uniqueId}`;
  const testCustomerPhone = "0988776655";

  test("1. Hangfire Dashboard hoạt động và hiển thị trạng thái server", async ({ page }) => {
    const response = await page.goto("http://localhost:8088/hangfire");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(/Hangfire|Background Jobs/i);
  });

  test("2. Khách đặt hàng không thanh toán, quá hạn hệ thống tự động hủy và hoàn trả tồn kho", async ({ page, request }) => {
    // 1. Ghi nhận tồn kho ban đầu của Variant 1
    const checkStockBefore = await request.get("http://localhost:8088/api/variants/1/price-stock");
    let stockBefore = 100;
    if (checkStockBefore.ok()) {
      const json = await checkStockBefore.json();
      stockBefore = json.data?.quantityInStock ?? 100;
    } else {
      const output = execSync(
        `sqlcmd -S localhost,14333 -U sa -P "YourStrong@Passw0rd!" -C -d AppleStoreDb -h -1 -W -Q "SET NOCOUNT ON; SELECT QuantityInStock FROM [catalog].[ProductVariants] WHERE Id = 1;"`
      ).toString().trim();
      stockBefore = parseInt(output, 10);
    }

    // 2. Mua hàng qua Storefront UI
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const checkoutBtn = page.locator("[data-testid='cart-checkout-button']");
    await checkoutBtn.click();
    await page.waitForURL("**/checkout");

    await page.fill("input#recipientName", testCustomerName);
    await page.fill("input#recipientPhone", testCustomerPhone);
    await page.fill("input#recipientEmail", `om_${uniqueId}@apple-store.com`);
    await page.fill("input#shippingProvince", "Hà Nội");
    await page.fill("input#shippingAddressLine", "123 Phố Huế, Hai Bà Trưng");

    // Chọn phương thức VNPay
    const vnpayRadio = page.locator("input[type='radio'][value='VNPAY']");
    if (await vnpayRadio.count() > 0) {
      await vnpayRadio.check({ force: true });
    }

    const submitOrderBtn = page.locator("button[type='submit']:has-text('Đặt hàng'), button:has-text('Hoàn tất')").first();
    await submitOrderBtn.click();

    // Chờ đơn được tạo
    await page.waitForTimeout(2000);

    // 3. Kiểm tra tồn kho đã bị trừ trong Database
    const stockAfterOrderOutput = execSync(
      `sqlcmd -S localhost,14333 -U sa -P "YourStrong@Passw0rd!" -C -d AppleStoreDb -h -1 -W -Q "SET NOCOUNT ON; SELECT QuantityInStock FROM [catalog].[ProductVariants] WHERE Id = 1;"`
    ).toString().trim();
    const stockAfterOrder = parseInt(stockAfterOrderOutput, 10);
    expect(stockAfterOrder).toBeLessThan(stockBefore);

    // 4. Tìm ID đơn hàng vừa tạo và lùi thời gian PlacedAt về 25 giờ trước (quá cả hạn 3h VNPay và 24h COD)
    const getOrderIdOutput = execSync(
      `sqlcmd -S localhost,14333 -U sa -P "YourStrong@Passw0rd!" -C -d AppleStoreDb -h -1 -W -Q "SET NOCOUNT ON; SELECT TOP 1 Id FROM [sales].[Orders] WHERE RecipientName = '${testCustomerName}' ORDER BY Id DESC;"`
    ).toString().trim();
    const orderId = parseInt(getOrderIdOutput, 10);
    expect(orderId).toBeGreaterThan(0);

    execSync(
      `sqlcmd -S localhost,14333 -U sa -P "YourStrong@Passw0rd!" -C -d AppleStoreDb -Q "UPDATE [sales].[Orders] SET [PlacedAt] = DATEADD(hour, -25, GETUTCDATE()) WHERE [Id] = ${orderId};"`
    );

    // 5. Kích hoạt Background Job bằng cách bấm 'Trigger now' trên Hangfire Dashboard
    await page.goto("http://localhost:8088/hangfire/recurring");
    await page.waitForLoadState("networkidle");

    const jobCheckbox = page.locator("input[type='checkbox'][value='stale-order-cleanup']");
    await jobCheckbox.check();

    const triggerNowBtn = page.locator("button:has-text('Trigger now')");
    await triggerNowBtn.click();

    // Chờ Hangfire worker hoàn tất xử lý đơn
    await page.waitForTimeout(3000);

    // 6. Xác minh trạng thái đơn hàng trong Database đã đổi sang Cancelled
    const orderStatusOutput = execSync(
      `sqlcmd -S localhost,14333 -U sa -P "YourStrong@Passw0rd!" -C -d AppleStoreDb -h -1 -W -Q "SET NOCOUNT ON; SELECT Status FROM [sales].[Orders] WHERE Id = ${orderId};"`
    ).toString().trim();
    expect(orderStatusOutput).toBe("Cancelled");

    // 7. Xác minh số lượng tồn kho đã được khôi phục nguyên vẹn
    const stockAfterCleanupOutput = execSync(
      `sqlcmd -S localhost,14333 -U sa -P "YourStrong@Passw0rd!" -C -d AppleStoreDb -h -1 -W -Q "SET NOCOUNT ON; SELECT QuantityInStock FROM [catalog].[ProductVariants] WHERE Id = 1;"`
    ).toString().trim();
    const stockAfterCleanup = parseInt(stockAfterCleanupOutput, 10);
    expect(stockAfterCleanup).toBe(stockBefore);
  });
});
