import { test, expect } from "@playwright/test";

test.describe("Identity & Authentication - Tách biệt Phân hệ Quản trị (Admin) và Khách hàng (Storefront)", () => {
  test("1. Người dùng chưa đăng nhập khi vào /admin/dashboard sẽ bị văng vào /admin/auth/login và không có chức năng đăng ký", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");

    // Phải được redirect tới /admin/auth/login
    await page.waitForURL((url) => url.pathname.includes("/admin/auth/login"));
    await expect(page).toHaveURL(/\/admin\/auth\/login/);

    // Tiêu đề cổng quản trị
    await expect(page.locator("h1, h2, .font-bold:has-text('Cổng Quản Trị Hệ Thống')").first()).toBeVisible();

    // Tuyệt đối không có link đăng ký tài khoản trên trang quản trị
    const registerLink = page.locator("a:has-text('Đăng ký ngay'), a[href*='register']");
    await expect(registerLink).toHaveCount(0);
  });

  test("2. Khách hàng vào /login có giao diện mua sắm và có link chuyển sang /register", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Tiêu đề đăng nhập khách hàng
    await expect(page.locator("h1, h2, .font-bold:has-text('Đăng Nhập Khách Hàng')").first()).toBeVisible();

    // Phải có link đăng ký tài khoản khách hàng
    const registerLink = page.locator("a:has-text('Đăng ký ngay')");
    await expect(registerLink).toBeVisible();

    // Click chuyển sang trang đăng ký /register
    await registerLink.click();
    await page.waitForURL((url) => url.pathname.includes("/register"));
    await expect(page).toHaveURL(/\/register/);
  });

  test("3. Đăng ký tài khoản khách hàng mới với đầy đủ thông tin: họ, tên, username, email, sđt, mật khẩu và nhập lại mật khẩu", async ({ page }) => {
    const timestamp = Date.now();
    const testUserName = `user_${timestamp}`;
    const testEmail = `user_${timestamp}@apple-store.com`;
    const testPassword = "User@123456";

    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.fill("input#lastName, input[placeholder*='Nguyễn Văn']", "Nguyễn");
    await page.fill("input#firstName, input[placeholder*='An']", "Văn Test");
    await page.fill("input#userName, input[placeholder*='nguyenvanan']", testUserName);
    await page.fill("input#email, input[placeholder*='an.nguyen@example.com']", testEmail);
    await page.fill("input#phoneNumber, input[placeholder*='0912 345 678']", "0987654321");
    await page.fill("input#password, input[name='password']", testPassword);
    await page.fill("input#confirmPassword, input[name='confirmPassword']", testPassword);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/register") && res.request().method() === "POST"),
      page.click("button[type='submit'], button:has-text('Đăng ký tài khoản')"),
    ]);

    expect(response.status()).toBe(200);

    // Sau khi đăng ký thành công tài khoản khách hàng, chuyển về Storefront "/"
    await page.waitForURL((url) => url.pathname === "/" || url.pathname === "");
    await expect(page).toHaveURL(/^(http:\/\/localhost:5173\/?)?$/);
  });

  test("4. Khách hàng đăng nhập bằng Username (hoặc Email), xem hồ sơ /profile và bị đá văng về '/' nếu đăng nhập tại cổng admin", async ({ page }) => {
    // 1. Khách hàng đăng nhập bình thường tại /login
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill("input#identifier, input[name='identifier']", "user@apple-store.com");
    await page.fill("input#password, input[name='password']", "User@123456");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/login") && res.request().method() === "POST"),
      page.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);

    expect(response.status()).toBe(200);

    // Chuyển về Storefront "/"
    await page.waitForURL((url) => url.pathname === "/" || url.pathname === "");
    await expect(page).toHaveURL(/^(http:\/\/localhost:5173\/?)?$/);

    // Click vào Avatar tài khoản khách hàng trên Storefront Header để mở Dropdown
    const userAvatar = page.locator("header .cursor-pointer:has(.bg-blue-100)");
    await expect(userAvatar).toBeVisible();
    await userAvatar.click();

    // Click chọn Thông tin tài khoản trong dropdown menu
    const profileMenuItem = page.locator(".ant-dropdown:not(.ant-dropdown-hidden) [role='menuitem']:has-text('Thông tin tài khoản'), .ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text('Thông tin tài khoản')").first();
    await expect(profileMenuItem).toBeVisible();
    await profileMenuItem.click();

    // Phải mở trang hồ sơ khách hàng riêng biệt /profile
    await page.waitForURL((url) => url.pathname.includes("/profile"));
    await expect(page.locator("h1:has-text('Hồ Sơ Khách Hàng')")).toBeVisible();
    await expect(page.locator("span:has-text('Khách hàng')").first()).toBeVisible();

    // Đăng xuất tài khoản khách hàng trên trang hồ sơ
    const logoutBtn = page.locator("button:has-text('Đăng xuất tài khoản')");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/logout") && res.request().method() === "POST"),
      logoutBtn.click(),
    ]);

    // Luồng chuẩn: Khách hàng đăng xuất tại trang nào thì vẫn ở nguyên trang đó (/profile), không văng ra /login
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator(":has-text('Vui lòng đăng nhập để xem thông tin tài khoản')").first()).toBeVisible();

    // 2. Thử cố tình đăng nhập bằng tài khoản role User tại /admin/auth/login -> Bị đá văng ngay về trang chủ "/"
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");

    await page.fill("input#identifier, input[name='identifier']", "user@apple-store.com");
    await page.fill("input#password, input[name='password']", "User@123456");

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/login") && res.request().method() === "POST"),
      page.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);

    // Role User không có quyền SuperAdmin -> Phải bị đá văng ngay về "/"
    await page.waitForURL((url) => url.pathname === "/" || url.pathname === "");
    await expect(page).toHaveURL(/^(http:\/\/localhost:5173\/?)?$/);
  });

  test("5. Quản trị viên (SuperAdmin) đăng nhập tại /admin/auth/login, vào Dashboard và Đăng xuất về /admin/auth/login", async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");

    await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
    await page.fill("input#password, input[name='password']", "Admin@123456");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/login") && res.request().method() === "POST"),
      page.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);

    expect(response.status()).toBe(200);

    // Vào cổng quản trị /admin/dashboard
    await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Header hiển thị đúng thông tin SuperAdmin
    await expect(page.locator("header:has-text('Quản trị viên Apple'), header:has-text('SuperAdmin')").first()).toBeVisible();

    // Click vào Avatar Admin để mở menu
    const adminAvatar = page.locator("header img[alt='User']");
    await expect(adminAvatar).toBeVisible();
    await adminAvatar.click();

    // Click Đăng xuất
    const logoutMenuItem = page.locator(".ant-dropdown:not(.ant-dropdown-hidden) [role='menuitem']:has-text('Đăng xuất'), .ant-dropdown:not(.ant-dropdown-hidden) :has-text('Đăng xuất')").last();
    await expect(logoutMenuItem).toBeVisible();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/logout") && res.request().method() === "POST"),
      logoutMenuItem.click(),
    ]);

    // Admin đăng xuất phải văng về /admin/auth/login
    await page.waitForURL((url) => url.pathname.includes("/admin/auth/login"));
    await expect(page).toHaveURL(/\/admin\/auth\/login/);

    // Khi đã đăng xuất, truy cập lại /admin/dashboard vẫn bị văng về /admin/auth/login
    await page.goto("/admin/dashboard");
    await page.waitForURL((url) => url.pathname.includes("/admin/auth/login"));
    await expect(page).toHaveURL(/\/admin\/auth\/login/);
  });

  test("6. Khi reload trang (F5) tại /admin/dashboard hoặc /profile, hệ thống tự động gọi refresh-token từ cookie để nạp lại token vào RAM và không bị văng login", async ({ page }) => {
    // 1. Đăng nhập Admin
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
    await page.fill("input#password, input[name='password']", "Admin@123456");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/login") && res.request().method() === "POST"),
      page.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);

    await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // 2. Reload lại trang /admin/dashboard (mô phỏng F5 / mở lại tab)
    const [refreshResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/refresh-token") && res.request().method() === "POST"),
      page.reload(),
    ]);

    expect(refreshResponse.status()).toBe(200);

    // Không bị văng về /admin/auth/login mà tiếp tục ở lại /admin/dashboard
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator("header:has-text('Quản trị viên Apple'), header:has-text('SuperAdmin')").first()).toBeVisible();

    // 3. Đăng xuất admin
    const adminAvatar = page.locator("header img[alt='User']");
    await adminAvatar.click();
    const logoutMenuItem = page.locator(".ant-dropdown:not(.ant-dropdown-hidden) [role='menuitem']:has-text('Đăng xuất'), .ant-dropdown:not(.ant-dropdown-hidden) :has-text('Đăng xuất')").last();
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/logout") && res.request().method() === "POST"),
      logoutMenuItem.click(),
    ]);

    // 4. Đăng nhập tài khoản User tại /login
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier, input[name='identifier']", "user@apple-store.com");
    await page.fill("input#password, input[name='password']", "User@123456");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/login") && res.request().method() === "POST"),
      page.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);
    await page.waitForURL((url) => url.pathname === "/" || url.pathname === "");

    // Vào /profile
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1:has-text('Hồ Sơ Khách Hàng')")).toBeVisible();

    // 5. Reload lại trang /profile
    const [userRefreshResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/refresh-token") && res.request().method() === "POST"),
      page.reload(),
    ]);
    expect(userRefreshResponse.status()).toBe(200);

    // Không bị văng login, thông tin khách hàng vẫn hiển thị đầy đủ
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator("h1:has-text('Hồ Sơ Khách Hàng')")).toBeVisible();
    await expect(page.locator("span:has-text('Khách hàng')").first()).toBeVisible();

    // 6. Quay lại trang chủ Storefront "/", đăng xuất qua Dropdown Header và xác nhận vẫn ở lại "/"
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/^(http:\/\/localhost:5173\/?)?$/);

    const userDropdownAvatar = page.locator("header .cursor-pointer:has(.bg-blue-100)");
    await userDropdownAvatar.click();

    const dropdownLogoutItem = page.locator(".ant-dropdown:not(.ant-dropdown-hidden) [role='menuitem']:has-text('Đăng xuất'), .ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text('Đăng xuất')").first();
    await expect(dropdownLogoutItem).toBeVisible();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/logout") && res.request().method() === "POST"),
      dropdownLogoutItem.click(),
    ]);

    // Luồng chuẩn: Người dùng ở trang nào vẫn sẽ ở trang đó ("/") sau khi đăng xuất, không bị văng ra /login
    await expect(page).toHaveURL(/^(http:\/\/localhost:5173\/?)?$/);
    await expect(page.locator("header button:has-text('Đăng nhập')")).toBeVisible();
  });
});

