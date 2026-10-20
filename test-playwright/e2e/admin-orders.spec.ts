import { test, expect } from "@playwright/test";

test.describe("Admin - Quản trị Đơn hàng & Snapshot (Orders Management)", () => {
  const uniqueId = Date.now();
  const testCustomerName = `Nguyễn Văn Test ${uniqueId}`;
  const testCustomerPhone = "0988776655";
  const testSku = `IP16P-SNAP-${uniqueId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");
  });

  test("Hiển thị trang quản lý đơn hàng và bảng dữ liệu", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Đơn hàng/i);
    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("input[placeholder*='Tìm theo mã đơn']")).toBeVisible();
  });

  test("Khởi tạo đơn hàng mẫu và kiểm tra hiển thị trên bảng", async ({ page, request }) => {
    const createRes = await request.post("http://localhost:5044/api/manager/orders", {
      data: {
        userId: 1,
        recipientName: testCustomerName,
        recipientPhone: testCustomerPhone,
        shippingAddressLine: "123 Nguyễn Huệ, Phường Bến Nghé",
        shippingDistrict: "Quận 1",
        shippingProvince: "Hồ Chí Minh",
        customerNote: "Giao trong giờ hành chính",
        paymentMethod: "COD",
        shippingFee: 30000,
        items: [
          {
            productName: "iPhone 16 Pro 256GB Snapshot",
            sku: testSku,
            colorName: "Titan Tự Nhiên",
            storageName: "256GB",
            unitPrice: 31990000,
            quantity: 1,
          },
        ],
      },
    });

    expect(createRes.status()).toBeLessThan(400);

    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    const table = page.locator(".ant-table");
    await expect(table).toContainText(testCustomerName);
    await expect(table).toContainText("Hồ Chí Minh");
  });

  test("Xem chi tiết đơn hàng và kiểm tra snapshot sản phẩm khi đặt", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testCustomerName}')`);
    await row.locator("button[aria-label='Xem chi tiết đơn hàng']").click();

    const drawer = page.locator(".ant-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Chi tiết đơn hàng");
    await expect(drawer).toContainText(testCustomerName);
    await expect(drawer).toContainText(testCustomerPhone);
    await expect(drawer).toContainText("123 Nguyễn Huệ");
    await expect(drawer).toContainText("Giao trong giờ hành chính");

    const snapshotTable = drawer.locator(".ant-table");
    await expect(snapshotTable).toContainText("iPhone 16 Pro 256GB Snapshot");
    await expect(snapshotTable).toContainText(testSku);
    await expect(snapshotTable).toContainText("Titan Tự Nhiên - 256GB");
  });

  test("Cập nhật trạng thái đơn hàng sang Đã xác nhận", async ({ page }) => {
    const row = page.locator(`.ant-table-row:has-text('${testCustomerName}')`);
    await row.locator("button[aria-label='Đổi trạng thái']").click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Cập nhật trạng thái");

    await modal.locator(".ant-select").first().click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Đã xác nhận')").click();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/orders/") && res.url().includes("/status") && res.request().method() === "PUT"
      ),
      modal.locator(".ant-modal-footer button:has-text('Lưu thay đổi')").click(),
    ]);

    await expect(modal).not.toBeVisible();
    await expect(page.locator(`.ant-table-row:has-text('${testCustomerName}')`)).toContainText("Đã xác nhận");
  });

  test("Lọc danh sách đơn hàng theo trạng thái", async ({ page }) => {
    await page.locator(".ant-select:has-text('Tất cả trạng thái')").click();
    await page.waitForSelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text('Đã xác nhận')").click();

    await page.waitForLoadState("networkidle");
    const table = page.locator(".ant-table");
    await expect(table).toContainText(testCustomerName);
    await expect(table).toContainText("Đã xác nhận");
  });
});
