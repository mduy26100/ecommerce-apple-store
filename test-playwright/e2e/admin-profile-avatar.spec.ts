import { test, expect } from "@playwright/test";

test.describe("Admin - Hồ sơ & Cập nhật Avatar (Profile & Avatar Upload Cropper)", () => {
  const sampleImagePath = "C:/Users/Admin/Documents/KryzoSoft/images/opengraph-image.png";

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/auth/login");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/admin/auth/login")) {
      await page.fill("input#identifier, input[name='identifier']", "admin@apple-store.com");
      await page.fill("input#password, input[name='password']", "Admin@123456");
      await page.click("form button[type='submit'], form button:has-text('Đăng nhập')");
      await page.waitForURL((url) => url.pathname.includes("/admin/dashboard"));
    }
    await page.goto("/admin/profile");
    await page.waitForLoadState("networkidle");
  });

  test("1. Hiển thị thông tin hồ sơ quản trị viên và icon UserOutlined fallback", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-page-header-heading-title").first()).toContainText(/Hồ Sơ Quản Trị Viên/i);

    const avatarCard = page.locator(".ant-card").first();
    await expect(avatarCard).toBeVisible();

    const unsplashImage = page.locator("img[src*='unsplash.com']");
    await expect(unsplashImage).toHaveCount(0);

    const avatarElement = avatarCard.locator(".ant-avatar");
    await expect(avatarElement).toBeVisible();

    const changeAvatarBtn = page.locator("button:has-text('Thay đổi ảnh đại diện')");
    await expect(changeAvatarBtn).toBeVisible();

    await expect(avatarCard.locator("text=admin@apple-store.com")).toBeVisible();
  });

  test("2. Tải ảnh lên, cắt ảnh tỷ lệ 1:1 qua ImageCropperModal và lưu avatar thành công", async ({ page }) => {
    const fileInput = page.locator("input[type='file'][accept*='image']");
    await fileInput.setInputFiles(sampleImagePath);

    const cropperModal = page.locator(".ant-modal:has-text('Cắt ảnh đại diện')");
    await expect(cropperModal).toBeVisible({ timeout: 10000 });

    const confirmCropBtn = cropperModal.locator(".ant-modal-footer button:has-text('Xác nhận')");
    await expect(confirmCropBtn).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/auth/avatar") && res.request().method() === "POST" && res.status() === 200,
        { timeout: 30000 }
      ),
      confirmCropBtn.click(),
    ]);

    await expect(cropperModal).not.toBeVisible({ timeout: 15000 });

    const json = await response.json();
    expect(json.data.avatarUrl).toBeTruthy();

    await expect(page.locator(".ant-message-success")).toBeVisible({ timeout: 10000 });

    const avatarImg = page.locator(".ant-card").first().locator(".ant-avatar img");
    await expect(avatarImg).toBeVisible();
    await expect(avatarImg).toHaveAttribute("src", json.data.avatarUrl);

    const headerAvatar = page.locator(".ant-layout-header .ant-avatar img");
    if (await headerAvatar.count() > 0) {
      await expect(headerAvatar).toHaveAttribute("src", json.data.avatarUrl);
    }
  });

  test("3. Cập nhật thông tin cơ bản họ tên thành công", async ({ page }) => {
    const fullNameInput = page.locator("input#fullName");
    await expect(fullNameInput).toBeVisible();

    const updatedName = "Quản trị viên Apple VIP";
    await fullNameInput.fill(updatedName);

    const [profileResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/auth/profile") && res.request().method() === "PUT" && res.status() === 200,
        { timeout: 15000 }
      ),
      page.click("button:has-text('Lưu thông tin cá nhân')"),
    ]);

    expect(profileResponse.status()).toBe(200);
    await expect(page.locator(".ant-message-success")).toBeVisible({ timeout: 10000 });
  });
});

