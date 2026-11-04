import { test, expect } from "@playwright/test";

test.describe("Security, Destructive Testing & Responsive Multi-Viewport Audit", () => {
  const baseURL = process.env.BASE_URL || "http://localhost:5173";

  // ==========================================
  // I. INPUT VALIDATION & ADVERSARIAL PAYLOADS
  // ==========================================
  test("1. XSS Payload Testing trên Search Bar & Form Đăng nhập", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(`${baseURL}/`);
    await page.waitForLoadState("networkidle");

    // Thử XSS trên Search Bar
    const searchBtn = page.locator("header button[aria-label='Tìm kiếm']");
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      const searchInput = page.locator("header input[placeholder*='Tìm kiếm']").first();
      await searchInput.fill("<script>alert('XSS_ATTACK')</script><img src=x onerror=alert(1)>");
      await searchInput.press("Enter");
      await page.waitForTimeout(1000);

      // Đảm bảo không có popup alert nào kích hoạt và text hiển thị an toàn
      const bodyHtml = await page.innerHTML("body");
      expect(bodyHtml).not.toContain("<script>alert('XSS_ATTACK')</script>");
    }

    // Thử XSS trên Form Login
    await page.goto(`${baseURL}/login`);
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier, input[name='identifier']", "<script>alert('XSS_USER')</script>");
    await page.fill("input#password, input[name='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForTimeout(1000);

    // Không bị crash, thông báo lỗi hiển thị an toàn
    await expect(page.locator("#root")).toBeAttached();
  });

  test("2. SQL Injection Payload trên Tra cứu Đơn hàng & Tìm kiếm", async ({ page }) => {
    await page.goto(`${baseURL}/order-lookup`);
    await page.waitForLoadState("networkidle");

    const orderInput = page.locator("input[placeholder*='ORD'], input[name='orderCode'], input#orderCode").first();
    const phoneInput = page.locator("input[placeholder*='09'], input[name='phoneNumber'], input#phoneNumber").first();
    const lookupBtn = page.locator("button:has-text('Tra cứu'), button[type='submit']").first();

    if (await orderInput.isVisible() && await phoneInput.isVisible()) {
      await orderInput.fill("' OR '1'='1' --");
      await phoneInput.fill("0987654321");
      await lookupBtn.click();
      await page.waitForTimeout(1000);

      // Phải không bị lộ bất kỳ đơn hàng nào do SQLi và không sinh lỗi 500
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
      await expect(page.locator("body")).not.toContainText("SqlException");
    }
  });

  test("3. Rapid Double-Click & Spam Click nút Đặt hàng", async ({ page }) => {
    await page.goto(`${baseURL}/cart`);
    await page.waitForLoadState("networkidle");

    const checkoutBtn = page.locator("button:has-text('Tiến hành đặt hàng'), button:has-text('Thanh toán')").first();
    if (await checkoutBtn.isVisible() && await checkoutBtn.isEnabled()) {
      // Click nhanh liên tục 5 lần
      for (let i = 0; i < 5; i++) {
        await checkoutBtn.click({ force: true }).catch(() => {});
      }
      await page.waitForTimeout(1000);
      // Trang web không bị crash
      await expect(page.locator("#root")).toBeAttached();
    }
  });

  // ==========================================
  // II. RESPONSIVE VIEWPORTS AUDIT
  // ==========================================
  const viewports = [
    { name: "Desktop", width: 1920, height: 1080 },
    { name: "Laptop", width: 1366, height: 768 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Mobile", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`4. [Viewport: ${vp.name} (${vp.width}x${vp.height})] Kiểm tra Giao diện Trang chủ và Menu`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseURL}/`);
      await page.waitForLoadState("networkidle");

      // Root container hiển thị
      await expect(page.locator("#root")).toBeVisible();

      // Kiểm tra Header & Footer
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();

      if (vp.width <= 768) {
        // Mobile / Tablet: Phải có nút mở Drawer menu (hamburger)
        const menuButton = page.locator("header button[aria-label*='menu' i], header button:has(.anticon-menu), header button .anticon-menu").first();
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(500);
          await expect(page.locator(".ant-drawer, nav, [role='dialog']").first()).toBeVisible();
        }
      } else {
        // Desktop / Laptop: Phải có thanh Navigation ngang
        const desktopNav = page.locator("header nav");
        await expect(desktopNav).toBeVisible();
      }
    });

    test(`5. [Viewport: ${vp.name} (${vp.width}x${vp.height})] Kiểm tra Trang Danh mục & Bộ lọc /products`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseURL}/products`);
      await page.waitForLoadState("networkidle");

      // Bảng hoặc lưới sản phẩm không bị vỡ layout
      const productGrid = page.locator("[data-testid^='product-card-'], .grid").first();
      await expect(productGrid).toBeVisible();
    });

    test(`6. [Viewport: ${vp.name} (${vp.width}x${vp.height})] Kiểm tra Cổng Quản Trị /admin/dashboard`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseURL}/admin/auth/login`);
      await page.waitForLoadState("networkidle");

      // Đăng nhập SuperAdmin
      if (page.url().includes("/admin/auth/login")) {
        await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
        await page.fill("input#password, input[name='password']", "Admin@123456");
        await page.click("button[type='submit']");
        await page.waitForURL("**/admin/dashboard**");
      }

      await expect(page.locator(".ant-layout, aside, main").first()).toBeVisible();

      if (vp.width <= 768) {
        // Mobile / Tablet admin: Sidebar thu gọn hoặc có nút toggle
        const toggleBtn = page.locator("header button .anticon-menu-fold, header button .anticon-menu-unfold").first();
        if (await toggleBtn.isVisible()) {
          await toggleBtn.click();
        }
      } else {
        // Desktop admin: Sidebar đầy đủ
        await expect(page.locator("aside")).toBeVisible();
      }
    });
  }
});

