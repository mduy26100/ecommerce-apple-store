import { test, expect } from "@playwright/test";

test.describe("Storefront HomePage - Hero Section Giới Thiệu Thương Hiệu & Hệ Sinh Thái", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#root")).toBeAttached();
  });

  test("1. Bố cục Hero nền trắng sáng, tràn viền liền mạch, không bị đóng khung Card-in-Card", async ({ page }) => {
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    const classAttr = await heroSection.getAttribute("class");
    expect(classAttr).toContain("w-full");
    expect(classAttr).toContain("bg-white");
    expect(classAttr).not.toContain("bg-black");
    expect(classAttr).not.toContain("rounded");
  });

  test("2. Cấu trúc nội dung giới thiệu thương hiệu và cam kết chất lượng theo chiều dọc", async ({ page }) => {
    const heroSection = page.locator("section").first();

    await expect(heroSection.getByText("Hệ Thống Bán Lẻ & Phân Phối Apple Chính Hãng")).toBeVisible();
    await expect(heroSection.getByRole("heading", { level: 1 })).toHaveText("Nâng Tầm Trải Nghiệm Công Nghệ Đỉnh Cao");
    await expect(heroSection.getByText("Không gian công nghệ Apple chuẩn mực cùng hệ sinh thái thiết bị đỉnh cao.")).toBeVisible();
    await expect(heroSection.getByText("Cam kết 100% sản phẩm chính hãng, bảo hành chuẩn mực toàn quốc")).toBeVisible();

    const exploreLink = heroSection.getByRole("link", { name: "Khám phá sản phẩm" });
    await expect(exploreLink).toBeVisible();
    await expect(exploreLink).toHaveAttribute("href", "#categories");

    const policyLink = heroSection.getByRole("link", { name: "Chính sách & Ưu đãi" });
    await expect(policyLink).toBeVisible();

    const ecosystemImage = heroSection.locator("img[alt*='Hệ sinh thái Apple']");
    await expect(ecosystemImage).toBeVisible();
    await expect(ecosystemImage).toHaveAttribute("src", "/apple-ecosystem-hero.png");
  });

  test("3. Tuyệt đối không chứa nút hay liên kết liên quan tới Cổng quản trị Admin trong Hero", async ({ page }) => {
    const heroSection = page.locator("section").first();
    const adminLink = heroSection.locator("a[href*='/admin']");
    await expect(adminLink).toHaveCount(0);
    await expect(heroSection.getByText(/quản trị/i)).toHaveCount(0);
  });

  test("4. Nút Khám phá sản phẩm dẫn cuộn mượt mà xuống khu vực danh mục", async ({ page }) => {
    const heroSection = page.locator("section").first();
    const exploreLink = heroSection.getByRole("link", { name: "Khám phá sản phẩm" });
    await exploreLink.click();
    await expect(page.locator("#categories")).toBeVisible();
  });
});
