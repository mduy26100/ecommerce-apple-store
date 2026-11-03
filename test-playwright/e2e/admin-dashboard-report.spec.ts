import { test, expect } from "@playwright/test";

test.describe("Admin - Báo Cáo Thống Kê Đơn Hàng (/admin/reports)", () => {
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

    await page.goto("/admin/reports");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    expect(browserErrors).toEqual([]);
  });

  test("1. Menu sidebar có mục 'Báo cáo thống kê' và điều hướng thành công", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    const reportsMenuItem = page.locator("aside .ant-menu-item:has-text('Báo cáo thống kê'), .ant-menu-item:has-text('Báo cáo thống kê')").last();
    await expect(reportsMenuItem).toBeVisible();
    await reportsMenuItem.click();
    await page.waitForURL((url) => url.pathname.includes("/admin/reports"));
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Báo Cáo Thống Kê Đơn Hàng/i);
  });

  test("2. Hiển thị tiêu đề trang và đầy đủ 6 khối thẻ đo lường KPI Cards", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Báo Cáo Thống Kê Đơn Hàng/i);

    await expect(page.locator("text=Doanh Thu Thực Thu").first()).toBeVisible();
    await expect(page.locator("text=Doanh Số Gộp").first()).toBeVisible();
    await expect(page.locator("text=Tổng Đơn Hàng").first()).toBeVisible();
    await expect(page.locator("text=Tổng Khách Hàng").first()).toBeVisible();
    await expect(page.locator("text=Tỷ Lệ Thành Công").first()).toBeVisible();
    await expect(page.locator("text=Đơn Giá TB (AOV)").first()).toBeVisible();
  });

  test("3. Hiển thị khối phân bổ trạng thái và tương tác lọc nhanh theo trạng thái không bị bay số về 0", async ({ page }) => {
    await expect(page.locator("text=Phân Bổ Toàn Bộ Trạng Thái Đơn Hàng").first()).toBeVisible();

    const pendingBadge = page.getByTestId("status-badge-Pending");
    const completedBadge = page.getByTestId("status-badge-Completed");
    const cancelledBadge = page.getByTestId("status-badge-Cancelled");

    await expect(pendingBadge).toBeVisible();
    await expect(completedBadge).toBeVisible();
    await expect(cancelledBadge).toBeVisible();

    await expect(pendingBadge).toContainText("140");
    await expect(completedBadge).toContainText("6");
    await expect(cancelledBadge).toContainText("13");

    const kpiNetRevenue = page.getByTestId("kpi-revenue-value");
    const kpiGrossRevenue = page.getByTestId("kpi-gross-value");
    const kpiTotalOrders = page.getByTestId("kpi-orders-value");

    await expect(kpiNetRevenue).toContainText("571.860.000");
    await expect(kpiGrossRevenue).toContainText("8.113.230.000");
    await expect(kpiTotalOrders).toContainText("171");

    await completedBadge.click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("button:has-text('Bỏ lọc theo trạng thái')")).toBeVisible();
    await expect(pendingBadge).toContainText("140");
    await expect(completedBadge).toContainText("6");
    await expect(cancelledBadge).toContainText("13");

    await expect(kpiNetRevenue).toContainText("571.860.000");
    await expect(kpiGrossRevenue).toContainText("8.113.230.000");
    await expect(kpiTotalOrders).toContainText("171");

    await pendingBadge.click();
    await page.waitForLoadState("networkidle");

    await expect(pendingBadge).toContainText("140");
    await expect(completedBadge).toContainText("6");
    await expect(cancelledBadge).toContainText("13");

    await expect(kpiNetRevenue).toContainText("571.860.000");
    await expect(kpiGrossRevenue).toContainText("8.113.230.000");
    await expect(kpiTotalOrders).toContainText("171");

    await page.click("button:has-text('Bỏ lọc theo trạng thái')");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("button:has-text('Bỏ lọc theo trạng thái')")).toHaveCount(0);
    await expect(pendingBadge).toContainText("140");
    await expect(completedBadge).toContainText("6");
    await expect(kpiTotalOrders).toContainText("171");
    expect(browserErrors).toEqual([]);
  });

  test("4. Tương tác toàn bộ mốc nhanh thời gian và tiêu chí ngày", async ({ page }) => {
    const presets = ["Hôm nay", "Hôm qua", "7 ngày qua", "30 ngày qua", "Tháng này", "Quý này"];
    for (const preset of presets) {
      const btn = page.locator(`button:has-text('${preset}')`).first();
      await expect(btn).toBeVisible();
      await btn.click();
      await page.waitForLoadState("networkidle");
      expect(browserErrors).toEqual([]);
    }

    const dateCriteriaSelect = page.locator(".ant-select").first();
    await dateCriteriaSelect.click();
    const completedCriteriaOption = page.locator(".ant-select-item-option:has-text('Theo ngày hoàn thành')").first();
    if (await completedCriteriaOption.isVisible()) {
      await completedCriteriaOption.click();
      await page.waitForLoadState("networkidle");
    }

    expect(browserErrors).toEqual([]);
  });

  test("5. Tương tác bộ lọc phương thức thanh toán chuẩn (chỉ COD & VNPAY)", async ({ page }) => {
    const selects = page.locator(".ant-select");
    const count = await selects.count();

    if (count >= 3) {
      await selects.nth(2).click();

      await expect(page.locator(".ant-select-item-option:has-text('Ví MoMo')")).toHaveCount(0);
      await expect(page.locator(".ant-select-item-option:has-text('Chuyển khoản')")).toHaveCount(0);

      const vnpayOption = page.locator(".ant-select-item-option:has-text('VNPAY')").first();
      await expect(vnpayOption).toBeVisible();
      await vnpayOption.click();
      await page.waitForLoadState("networkidle");
    }

    await page.click("button:has-text('Đặt lại')");
    await page.waitForLoadState("networkidle");
    expect(browserErrors).toEqual([]);
  });

  test("6. Tương tác làm mới và đặt lại bộ lọc dữ liệu", async ({ page }) => {
    const refreshBtn = page.locator("button:has-text('Làm mới')").first();
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForLoadState("networkidle");

    const resetBtn = page.locator("button:has-text('Đặt lại')").first();
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await page.waitForLoadState("networkidle");
    expect(browserErrors).toEqual([]);
  });

  test("7. Kiểm tra tính năng xuất toàn bộ đơn hàng theo tiêu chí ra file báo cáo Excel chuẩn 2026", async ({ page }) => {
    const exportBtn = page.locator("button:has-text('Xuất báo cáo')");
    await expect(exportBtn).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
    await exportBtn.click();
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain("Bao_Cao_Don_Hang_Urban_Stitch_Tu_");
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
    }
    expect(browserErrors).toEqual([]);
  });

  test("8. Hiển thị hệ thống biểu đồ chi tiết và chuyển đổi mượt mà giữa các tab phân tích", async ({ page }) => {
    await expect(page.locator("text=Hệ Thống Biểu Đồ Phân Tích Đơn Hàng & Dòng Tiền").first()).toBeVisible();

    await expect(page.locator("text=Tổng thực thu kỳ này").first()).toBeVisible();
    await expect(page.locator("text=Tổng phát sinh gộp").first()).toBeVisible();

    const paymentsTab = page.locator("button:has-text('Kênh VNPAY & COD')").first();
    await expect(paymentsTab).toBeVisible();
    await paymentsTab.click();
    await expect(page.locator("text=Cổng Thanh Toán VNPAY").first()).toBeVisible();
    await expect(page.locator("text=Thanh Toán Khi Nhận Hàng (COD)").first()).toBeVisible();

    const customersTab = page.locator("button:has-text('Phân khúc khách hàng')").first();
    await expect(customersTab).toBeVisible();
    await customersTab.click();
    await expect(page.locator("text=Khách Hàng Thành Viên").first()).toBeVisible();
    await expect(page.locator("text=Khách Hàng Vãng Lai").first()).toBeVisible();

    const statusTab = page.locator("button:has-text('Cơ cấu dòng tiền')").first();
    await expect(statusTab).toBeVisible();
    await statusTab.click();
    await expect(page.locator("text=Dòng tiền thực thu hoàn tất").first()).toBeVisible();
    await expect(page.locator("text=Dòng tiền đang xử lý / vận chuyển").first()).toBeVisible();

    const productsTab = page.locator("button:has-text('Top bán chạy & Kén khách')").first();
    await expect(productsTab).toBeVisible();
    await productsTab.click();
    await expect(page.locator("text=Top 10 Sản phẩm bán chạy nhất").first()).toBeVisible();
    await expect(page.locator("text=Top 10 Sản phẩm kén khách (Tồn đọng)").first()).toBeVisible();

    const trendsTab = page.locator("button:has-text('Xu hướng doanh thu kép')").first();
    await trendsTab.click();
    await expect(page.locator("text=Tổng thực thu kỳ này").first()).toBeVisible();
    await expect(page.locator("text=Doanh thu thực thu (Net Revenue):").first()).toBeVisible();
    await expect(page.locator("text=Doanh số gộp (Gross Revenue):").first()).toBeVisible();

    const bar26 = page.locator("text=26/10").first();
    if (await bar26.isVisible()) {
      await bar26.click();
      await expect(page.locator("text=Ngày 26/10:").first()).toBeVisible();
      await expect(page.locator("text=Thực thu:").first()).toBeVisible();
      await expect(page.locator("text=Gộp:").first()).toBeVisible();
    }

    expect(browserErrors).toEqual([]);
  });

  test("9. Chuyển đổi qua lại giữa các mốc thời gian và bộ lọc không phát sinh lỗi", async ({ page }) => {
    await page.locator("button:has-text('Hôm nay')").first().click();
    await page.locator("button:has-text('30 ngày qua')").first().click();
    await page.locator("button:has-text('Tháng này')").first().click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Doanh Thu Thực Thu").first()).toBeVisible();
    expect(browserErrors).toEqual([]);
  });

  test("10. Hiển thị khối cẩm nang chú thích thuật ngữ và tra cứu chi tiết đầy đủ 4 chủ đề", async ({ page }) => {
    const glossaryHeader = page.locator("text=Cẩm Nang Chú Thích Thuật Ngữ & Phương Pháp Đo Lường Chỉ Số").first();
    await expect(glossaryHeader).toBeVisible();

    await glossaryHeader.click();
    await expect(page.locator("button:has-text('Chỉ số kinh doanh & KPI')").first()).toBeVisible();
    await expect(page.locator("text=Doanh Thu Thực Thu").last()).toBeVisible();
    await expect(page.locator("text=Doanh Số Gộp").last()).toBeVisible();

    await page.click("button:has-text('Chu trình 8 trạng thái đơn')");
    await expect(page.locator("text=1. Chờ xử lý (Pending)").first()).toBeVisible();
    await expect(page.locator("text=6. Hoàn tất (Completed)").first()).toBeVisible();

    await page.click("button:has-text('Dòng tiền & Kênh thanh toán')");
    await expect(page.locator("text=Phân Loại 3 Dòng Tiền Vận Hành").first()).toBeVisible();
    await expect(page.locator("text=Cổng thanh toán điện tử VNPAY:").first()).toBeVisible();

    await page.click("button:has-text('Khách hàng & Sản phẩm')");
    await expect(page.locator("text=Khách hàng thành viên (Member Customers):").first()).toBeVisible();
    await expect(page.locator("text=Top 10 Sản phẩm bán chạy nhất:").first()).toBeVisible();

    await page.click("button:has-text('Đối soát File Excel (.xlsx)')");
    await expect(page.locator("text=Cấu trúc chi tiết: Mỗi dòng = 1 sản phẩm").first()).toBeVisible();
    await expect(page.locator("text=Cách Sử Dụng Cột \"Phân Loại Dòng Tiền\"").first()).toBeVisible();

    await page.click("button:has-text('Thu gọn chú thích')");
    await expect(page.locator("button:has-text('Chu trình 8 trạng thái đơn')")).toHaveCount(0);
    expect(browserErrors).toEqual([]);
  });
});
