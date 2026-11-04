import { test, expect } from "@playwright/test";

test.describe.serial("Admin - Quản Lý Người Dùng (Users Management & Lockout Flow)", () => {
  let testEmail = "";
  let testUserName = "";
  let testFullName = "";
  const testPassword = "User@123456";
  const newPassword = "NewUser@654321";

  test.beforeAll(() => {
    const timestamp = Date.now();
    testEmail = `testuser_${timestamp}@apple-store.com`;
    testUserName = `testuser_${timestamp}`;
    testFullName = `Người Dùng Test ${timestamp}`;
  });

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

  test("1. Menu sidebar có mục 'Quản lý người dùng' độc lập và không còn mục Roles", async ({ page }) => {
    const userMenuItem = page.locator(".ant-layout-sider .ant-menu-item:has-text('Quản lý người dùng')");
    await expect(userMenuItem).toBeVisible();

    const roleMenuItem = page.locator(".ant-layout-sider :has-text('Vai trò')");
    await expect(roleMenuItem).toHaveCount(0);

    await userMenuItem.click();
    await page.waitForURL((url) => url.pathname.includes("/admin/users"));
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Quản Lý Người Dùng/i);
  });

  test("2. Tải trang quản lý người dùng, hiển thị bảng dữ liệu và loại trừ SuperAdmin", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".ant-table")).toBeVisible();
    await expect(page.locator("input#userSearchInput")).toBeVisible();
    await expect(page.locator("#userStatusFilter")).toBeVisible();
    await expect(page.locator("button:has-text('Thêm người dùng mới')")).toBeVisible();

    const superAdminTag = page.locator(".ant-table-row:has-text('SuperAdmin')");
    await expect(superAdminTag).toHaveCount(0);

    const userRows = page.locator(".ant-table-tbody tr.ant-table-row");
    await expect(userRows.first()).toBeVisible({ timeout: 10000 });
  });

  test("3. Thêm mới một tài khoản người dùng thành công", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm người dùng mới')");
    const modal = page.locator(".ant-modal:has-text('Thêm Người Dùng Mới')");
    await expect(modal).toBeVisible();

    await page.fill("input#createFullName", testFullName);
    await page.fill("input#createEmail", testEmail);
    await page.fill("input#createUserName", testUserName);
    await page.fill("input#createPhoneNumber", "0987654321");
    await page.fill("input#createPassword", testPassword);
    await page.fill("input#createConfirmPassword", testPassword);

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/users") && res.request().method() === "POST" && res.status() === 200,
        { timeout: 15000 }
      ),
      modal.locator(".ant-modal-footer button:has-text('Tạo tài khoản')").click(),
    ]);

    expect(response.status()).toBe(200);
    await expect(modal).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator(".ant-message-success").first()).toBeVisible({ timeout: 10000 });

    await page.fill("input#userSearchInput", testEmail);
    await page.press("input#userSearchInput", "Enter");
    await page.waitForLoadState("networkidle");

    const createdRow = page.locator(`.ant-table-row:has-text('${testEmail}')`);
    await expect(createdRow).toBeVisible({ timeout: 10000 });
  });

  test("4. Bắt lỗi trùng lặp: Tạo user với email đã tồn tại trả về HTTP 400 và thông báo tiếng Việt", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Thêm người dùng mới')");
    const modal = page.locator(".ant-modal:has-text('Thêm Người Dùng Mới')");
    await expect(modal).toBeVisible();

    await page.fill("input#createFullName", "Người Dùng Trùng Lặp");
    await page.fill("input#createEmail", testEmail);
    await page.fill("input#createPassword", "User@123456");
    await page.fill("input#createConfirmPassword", "User@123456");

    const [errorResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/users") && res.request().method() === "POST" && res.status() === 400,
        { timeout: 15000 }
      ),
      modal.locator(".ant-modal-footer button:has-text('Tạo tài khoản')").click(),
    ]);

    expect(errorResponse.status()).toBe(400);
    const json = await errorResponse.json();
    expect(json.error.message).toContain("đã tồn tại trong hệ thống");

    await expect(page.locator(".ant-message-error").first()).toBeVisible({ timeout: 10000 });
    await expect(modal).toBeVisible();

    await modal.locator(".ant-modal-footer button:has-text('Hủy')").click();
  });

  test("5. Chỉnh sửa thông tin họ tên người dùng thành công", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await page.fill("input#userSearchInput", testEmail);
    await page.press("input#userSearchInput", "Enter");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testEmail}')`);
    await expect(row).toBeVisible();

    await row.locator("button:has(.anticon-edit)").click();
    const editModal = page.locator(".ant-modal:has-text('Chỉnh Sửa Thông Tin Người Dùng')");
    await expect(editModal).toBeVisible();

    const updatedName = `${testFullName} (VIP)`;
    await page.fill("input#editFullName", updatedName);

    const [updateResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/manager/users") && res.request().method() === "PUT" && res.status() === 200,
        { timeout: 15000 }
      ),
      editModal.locator(".ant-modal-footer button:has-text('Lưu thay đổi')").click(),
    ]);

    expect(updateResponse.status()).toBe(200);
    await expect(editModal).not.toBeVisible();
    await expect(page.locator(".ant-message-success").first()).toBeVisible();
  });

  test("6. Xem chi tiết hồ sơ người dùng qua Drawer", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await page.fill("input#userSearchInput", testEmail);
    await page.press("input#userSearchInput", "Enter");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testEmail}')`);
    await row.locator("button:has(.anticon-eye)").click();

    const drawer = page.locator(".ant-drawer:has-text('Chi Tiết Hồ Sơ Người Dùng')");
    await expect(drawer).toBeVisible({ timeout: 10000 });
    await expect(drawer.locator(`text=${testEmail}`).first()).toBeVisible();

    await drawer.locator(".ant-drawer-close").click();
    await expect(drawer).not.toBeVisible();
  });

  test("7. Khóa tài khoản người dùng theo ngày và chặn đăng nhập", async ({ page, browser }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await page.fill("input#userSearchInput", testEmail);
    await page.press("input#userSearchInput", "Enter");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testEmail}')`);
    await row.locator("button:has(.anticon-lock)").click();

    const lockModal = page.locator(".ant-modal:has-text('Tạm Khóa Tài Khoản Người Dùng')");
    await expect(lockModal).toBeVisible();

    const [lockResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/lock") && res.request().method() === "POST" && res.status() === 200,
        { timeout: 15000 }
      ),
      lockModal.locator(".ant-modal-footer button:has-text('Xác nhận khóa')").click(),
    ]);

    expect(lockResponse.status()).toBe(200);
    await expect(lockModal).not.toBeVisible();

    await expect(row.locator(".ant-tag:has-text('Tạm khóa')")).toBeVisible({ timeout: 10000 });

    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    await userPage.goto("/login");
    await userPage.waitForLoadState("networkidle");

    await userPage.fill("input#identifier, input[name='identifier']", testEmail);
    await userPage.fill("input#password, input[name='password']", testPassword);

    const [loginFailResponse] = await Promise.all([
      userPage.waitForResponse(
        (res) => res.url().includes("/api/auth/login") && res.request().method() === "POST" && res.status() === 401,
        { timeout: 15000 }
      ),
      userPage.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);

    expect(loginFailResponse.status()).toBe(401);
    const loginError = await loginFailResponse.json();
    expect(loginError.error.message).toContain("bị khóa");
    await userContext.close();
  });

  test("8. Mở khóa tài khoản người dùng và đăng nhập lại thành công", async ({ page, browser }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await page.fill("input#userSearchInput", testEmail);
    await page.press("input#userSearchInput", "Enter");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testEmail}')`);
    await row.locator("button:has(.anticon-unlock)").click();

    const popconfirm = page.locator(".ant-popover:visible");
    await expect(popconfirm).toBeVisible();

    const [unlockResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/unlock") && res.request().method() === "POST" && res.status() === 200,
        { timeout: 15000 }
      ),
      popconfirm.locator("button.ant-btn-primary:has-text('Mở khóa')").click(),
    ]);

    expect(unlockResponse.status()).toBe(200);
    await expect(row.locator(".ant-tag:has-text('Đang hoạt động')")).toBeVisible({ timeout: 10000 });

    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    await userPage.goto("/login");
    await userPage.waitForLoadState("networkidle");

    await userPage.fill("input#identifier, input[name='identifier']", testEmail);
    await userPage.fill("input#password, input[name='password']", testPassword);

    const [loginSuccessResponse] = await Promise.all([
      userPage.waitForResponse(
        (res) => res.url().includes("/api/auth/login") && res.request().method() === "POST" && res.status() === 200,
        { timeout: 15000 }
      ),
      userPage.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);

    expect(loginSuccessResponse.status()).toBe(200);
    await userPage.waitForURL((url) => !url.pathname.includes("/login"));
    await userContext.close();
  });

  test("9. Đặt lại mật khẩu cho người dùng từ Admin và đăng nhập với mật khẩu mới", async ({ page, browser }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    await page.fill("input#userSearchInput", testEmail);
    await page.press("input#userSearchInput", "Enter");
    await page.waitForLoadState("networkidle");

    const row = page.locator(`.ant-table-row:has-text('${testEmail}')`);
    await row.locator("button:has(.anticon-key)").click();

    const resetModal = page.locator(".ant-modal:has-text('Đặt Lại Mật Khẩu Người Dùng')");
    await expect(resetModal).toBeVisible();

    await page.fill("input#resetNewPassword", newPassword);
    await page.fill("input#resetConfirmPassword", newPassword);

    const [resetResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/reset-password") && res.request().method() === "POST" && res.status() === 200,
        { timeout: 15000 }
      ),
      resetModal.locator(".ant-modal-footer button:has-text('Xác nhận đổi')").click(),
    ]);

    expect(resetResponse.status()).toBe(200);
    await expect(resetModal).not.toBeVisible();

    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    await userPage.goto("/login");
    await userPage.waitForLoadState("networkidle");

    await userPage.fill("input#identifier, input[name='identifier']", testEmail);
    await userPage.fill("input#password, input[name='password']", newPassword);

    const [loginWithNewPass] = await Promise.all([
      userPage.waitForResponse(
        (res) => res.url().includes("/api/auth/login") && res.request().method() === "POST" && res.status() === 200,
        { timeout: 15000 }
      ),
      userPage.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
    ]);

    expect(loginWithNewPass.status()).toBe(200);
    await userPage.waitForURL((url) => !url.pathname.includes("/login"));
    await userContext.close();
  });
});
