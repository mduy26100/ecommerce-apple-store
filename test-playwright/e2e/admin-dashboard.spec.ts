import { test, expect } from "@playwright/test";

test.describe("Admin - Dashboard Tổng Quan (/admin/dashboard)", () => {
  const browserErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    browserErrors.length = 0;
    page.on("pageerror", (err) => {
      browserErrors.push(err.message);
    });

    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");

      await Promise.all([
        page.waitForResponse((res) => res.url().includes("/auth/login") && res.request().method() === "POST"),
        page.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
      ]);

      await page.waitForURL((url) => !url.pathname.includes("/admin/auth/login"));
    }

    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    expect(browserErrors).toEqual([]);
  });

  test("1. Hiển thị tiêu đề trang và thanh mốc thời gian nhanh gọn gàng", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Tổng quan hệ thống/i);

    await expect(page.locator("button:has-text('Hôm nay')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Hôm qua')").first()).toBeVisible();
    await expect(page.locator("button:has-text('7 ngày qua')").first()).toBeVisible();
    await expect(page.locator("button:has-text('30 ngày qua')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Tháng này')").first()).toBeVisible();

    await expect(page.locator("text=TẦNG 1")).toHaveCount(0);
    await expect(page.locator("text=TẦNG 2")).toHaveCount(0);
    await expect(page.locator("text=TẦNG 3")).toHaveCount(0);
    await expect(page.locator("text=TẦNG 4")).toHaveCount(0);
  });

  test("2. Hiển thị đầy đủ các thẻ đo lường nhanh tinh giản, không rối mắt", async ({ page }) => {
    await expect(page.locator("text=Doanh Thu Thực Thu").first()).toBeVisible();
    await expect(page.locator("text=Tổng Đơn Hàng").first()).toBeVisible();
    await expect(page.locator("text=Đơn Giá TB (AOV)").first()).toBeVisible();
    await expect(page.locator("text=Khách Hàng Hoạt Động").first()).toBeVisible();
    await expect(page.locator("text=Tổng Số Sản Phẩm").first()).toBeVisible();
    await expect(page.locator("text=Thể Loại Danh Mục").first()).toBeVisible();
    await expect(page.locator("text=Tổng Biến Thể (SKU)").first()).toBeVisible();
    await expect(page.locator("text=Tổng Số Lượng Tồn Kho").first()).toBeVisible();
  });

  test("3. Hàng đợi công việc khẩn cấp làm phẳng, không lồng khung và chuyển hướng chuẩn", async ({ page }) => {
    await expect(page.locator("text=Hàng đợi công việc khẩn cấp").first()).toBeVisible();

    await expect(page.locator("text=Cần xác nhận").first()).toBeVisible();
    await expect(page.locator("text=Đóng gói & Giao vận").first()).toBeVisible();
    await expect(page.locator("text=Khiếu nại / Trả hàng").first()).toBeVisible();
    await expect(page.locator("text=Lỗi thanh toán").first()).toBeVisible();
    await expect(page.locator("text=Trễ hạn SLA").first()).toBeVisible();

    const pendingCard = page.locator("text=Cần xác nhận").locator("..");
    await pendingCard.click();
    await page.waitForURL((url) => url.pathname.includes("/admin/orders"));
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Quản lý đơn hàng/i);
  });

  test("4. Biểu đồ trực quan và tỷ lệ kênh thanh toán chỉ gồm VNPAY và COD", async ({ page }) => {
    await expect(page.locator("text=Xu hướng doanh thu & số đơn theo ngày").first()).toBeVisible();
    await expect(page.locator("text=Tỷ lệ trạng thái đơn hàng").first()).toBeVisible();
    await expect(page.locator("text=Kênh thanh toán (VNPAY & COD)").first()).toBeVisible();
    await expect(page.locator("text=Cơ cấu danh mục & kho hàng toàn hệ thống").first()).toBeVisible();
    await expect(page.locator("text=iPhone").first()).toBeVisible();

    await expect(page.locator("text=Ví MoMo")).toHaveCount(0);
    await expect(page.locator("text=Chuyển khoản")).toHaveCount(0);
  });

  test("5. Bảng xếp hạng và luồng 5 đơn hàng gần đây tóm tắt tinh gọn", async ({ page }) => {
    await expect(page.locator("text=Top 5 sản phẩm bán chạy nhất").first()).toBeVisible();
    await expect(page.locator("text=Top 5 sản phẩm sắp cạn kho").first()).toBeVisible();
    await expect(page.locator("text=Top khách hàng chi tiêu").first()).toBeVisible();
    await expect(page.locator("text=Luồng đơn hàng gần đây").first()).toBeVisible();

    await expect(page.locator("button:has-text('Xem')")).toHaveCount(0);
    expect(browserErrors).toEqual([]);
  });

  test("6. Tương tác mốc thời gian nhanh và nút làm mới không sinh lỗi JS", async ({ page }) => {
    const timeScopes = ["Hôm nay", "Hôm qua", "7 ngày qua", "30 ngày qua", "Tháng này"];

    for (const scope of timeScopes) {
      const btn = page.locator(`button:has-text('${scope}')`).first();
      await expect(btn).toBeVisible();
      await btn.click();
      await page.waitForLoadState("networkidle");
      expect(browserErrors).toEqual([]);
    }

    const refreshBtn = page.locator("button:has-text('Làm mới')").first();
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Đã làm mới dữ liệu tổng quan!").first()).toBeVisible();
    expect(browserErrors).toEqual([]);
  });

  test("7. Chuyển đổi nhanh liên tục giữa các bộ lọc không văng lỗi", async ({ page }) => {
    await page.locator("button:has-text('Hôm nay')").first().click();
    await page.locator("button:has-text('30 ngày qua')").first().click();
    await page.locator("button:has-text('Tháng này')").first().click();
    await page.locator("button:has-text('7 ngày qua')").first().click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Doanh Thu Thực Thu").first()).toBeVisible();
    expect(browserErrors).toEqual([]);
  });
});
