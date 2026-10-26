import { test, expect } from "@playwright/test";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8088";

test.describe("Storefront - Toàn bộ Quy trình Thanh toán & Quản lý Đơn hàng (Checkout & Orders Flow)", () => {
  test("1. Khách vãng lai: Đặt hàng COD, áp dụng voucher APPLE2026, chuyển hướng trang thành công", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(600);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const checkoutBtn = page.locator("[data-testid='cart-checkout-button']");
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();

    await page.waitForURL("**/checkout", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Xác nhận & Thanh toán đơn hàng/i);

    await expect(page.locator("text=1. Sản phẩm thanh toán")).toBeVisible();
    await expect(page.locator("text=iPhone 16 Pro Max")).toBeVisible();

    const testEmail = `guest_order_${Date.now()}@apple-test.com`;
    const testPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.fill("input#recipientName", "Trần Khách Vãng Lai");
    await page.fill("input#recipientPhone", testPhone);
    await page.fill("input#recipientEmail", testEmail);
    await page.fill("input#shippingProvince", "TP. Hồ Chí Minh");
    await page.fill("input#shippingAddressLine", "Số 123 Nguyễn Huệ, Phường Bến Nghé");

    await expect(page.locator("text=Mã ưu đãi công khai có sẵn:")).toBeVisible();
    await expect(page.locator("text=Nhập mã APPLE2026 để được giảm 10%")).toBeVisible();
    await expect(page.locator("text=lượt dùng").first()).toBeVisible();

    const voucherCard = page.locator("div:has-text('Nhập mã APPLE2026')").last();
    const [validateRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/vouchers/validate")),
      voucherCard.click(),
    ]);
    expect(validateRes.status()).toBe(200);

    await expect(page.locator("text=Đã áp dụng")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Ưu đãi voucher")).toBeVisible();

    const paymentSection = page.locator("text=Chi tiết & Phương thức thanh toán");
    await expect(paymentSection).toBeVisible();

    const codOption = page.locator("text=Thanh toán khi nhận hàng (COD)");
    await expect(codOption).toBeVisible();

    const onlineOption = page.locator("text=Cổng thanh toán điện tử VNPAY");
    await expect(onlineOption).toBeVisible();

    const [createOrderResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);

    expect(createOrderResponse.status()).toBe(200);
    const orderData = await createOrderResponse.json();
    const createdOrderNumber = orderData?.data?.orderNumber || orderData?.orderNumber;
    expect(createdOrderNumber).toMatch(/^ORD-/);

    await page.waitForURL("**/checkout/success", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Đặt hàng thành công/i);
    await expect(page.locator(`text=${createdOrderNumber}`)).toBeVisible();
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();
  });

  test("2. Khách vãng lai: Hiển thị Đơn hàng gần đây trên thiết bị và Tra cứu chi tiết đơn hàng", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(600);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    const lookupEmail = `lookup_test_${Date.now()}@apple.com`;
    await page.fill("input#recipientName", "Khách Tra Cứu");
    await page.fill("input#recipientPhone", "0901234567");
    await page.fill("input#recipientEmail", lookupEmail);
    await page.fill("input#shippingProvince", "Đà Nẵng");
    await page.fill("input#shippingAddressLine", "Bạch Đằng, Hải Châu");

    const [orderRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(orderRes.status()).toBe(200);
    const orderInfo = await orderRes.json();
    const orderNum = orderInfo?.data?.orderNumber || orderInfo?.orderNumber;

    await page.waitForURL("**/checkout/success");

    await page.goto("/order-lookup");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText(/Tra cứu tiến trình đơn hàng/i);

    const recentOrderBox = page.locator(`text=${orderNum}`);
    await expect(recentOrderBox).toBeVisible({ timeout: 10000 });

    await page.fill("input#orderNumber", orderNum);
    await page.fill("input#phoneOrEmail", lookupEmail);
    await page.click("button:has-text('Tra cứu đơn hàng')");

    await expect(page.locator(".ant-steps-horizontal")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".ant-steps-item-title", { hasText: "Chờ xử lý" })).toBeVisible();
    await expect(page.locator("text=Khách Tra Cứu").first()).toBeVisible();
    await expect(page.locator(`text=${lookupEmail}`).first()).toBeVisible();
    await expect(page.locator("text=Cần hỗ trợ về đơn hàng này?")).toBeVisible();
    await expect(page.locator("button:has-text('Hủy đơn hàng')")).toHaveCount(0);
  });

  test("3. Thành viên đăng nhập: Tự động điền hồ sơ, áp dụng voucher từ ví, đặt hàng và xem trong Đơn hàng của tôi", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill("input#identifier", "user@apple-store.com");
    await page.fill("input#password", "User@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/", { timeout: 10000 });

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await addToCartBtn.click();
    await page.waitForTimeout(600);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("input#recipientEmail")).toHaveValue("user@apple-store.com");
    await expect(page.locator("text=Đã đăng nhập")).toBeVisible();

    const openWalletBtn = page.locator("button:has-text('Mở ví voucher')");
    await openWalletBtn.click();

    await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Ví Voucher & Ưu Đãi Của Bạn")).toBeVisible();

    const applyModalBtn = page.locator(".ant-modal button:has-text('Áp dụng')").first();
    await expect(applyModalBtn).toBeVisible({ timeout: 10000 });

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/vouchers/validate")),
      applyModalBtn.click(),
    ]);
    await expect(page.locator(".ant-modal")).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Đã áp dụng")).toBeVisible({ timeout: 10000 });

    const submitBtn = page.locator("button:has-text('Hoàn tất đặt hàng')");
    await submitBtn.scrollIntoViewIfNeeded();

    const [memberOrderRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      submitBtn.click(),
    ]);
    expect(memberOrderRes.status()).toBe(200);
    const memberOrderData = await memberOrderRes.json();
    const memberOrderNumber = memberOrderData?.data?.orderNumber || memberOrderData?.orderNumber;

    await page.waitForURL("**/checkout/success");

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText(/Đơn hàng của tôi/i);
    await expect(page.locator(`text=${memberOrderNumber}`)).toBeVisible({ timeout: 10000 });
  });

  test("4. Tự động quy nạp đơn hàng mồ côi qua Email khi khách vãng lai đăng ký tài khoản", async ({ page }) => {
    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button']");
    await addToCartBtn.click();
    await page.waitForTimeout(600);

    const orphanEmail = `orphan_${Date.now()}@apple-customer.vn`;

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    await page.fill("input#recipientName", "Khách Mồ Côi");
    await page.fill("input#recipientPhone", "0933123456");
    await page.fill("input#recipientEmail", orphanEmail);
    await page.fill("input#shippingProvince", "Hải Phòng");
    await page.fill("input#shippingAddressLine", "Lê Hồng Phong, Ngô Quyền");

    const [orphanRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(orphanRes.status()).toBe(200);
    const orphanData = await orphanRes.json();
    const orphanOrderNumber = orphanData?.data?.orderNumber || orphanData?.orderNumber;

    await page.waitForURL("**/checkout/success");

    const uniqueUser = `user_${Date.now()}`;
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.fill("input#firstName", "Khách");
    await page.fill("input#lastName", "Mới");
    await page.fill("input#userName", uniqueUser);
    await page.fill("input#email", orphanEmail);
    await page.fill("input#phoneNumber", "0933123456");
    await page.fill("input#password", "Apple@123456");
    await page.fill("input#confirmPassword", "Apple@123456");

    const [regRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/register") && res.request().method() === "POST"),
      page.click("button[type='submit']"),
    ]);
    expect(regRes.status()).toBe(200);

    await page.waitForURL("**/", { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(`text=${orphanOrderNumber}`)).toBeVisible({ timeout: 10000 });
  });

  test("5. Bảo mật Backend: Kiểm tra chống làm sai lệch dữ liệu từ FE (Đơn giá, voucher giả mạo, phương thức thanh toán)", async ({ request }) => {
    const fakeVoucherRes = await request.post("/api/orders", {
      data: {
        recipientName: "Khách Hack Voucher",
        recipientPhone: "0912345678",
        recipientEmail: "hacker@test.com",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "123 Phố Lạ",
        paymentMethod: "COD",
        shippingFee: 0,
        voucherCode: "MA_GIAM_GIA_KHONG_TON_TAI_999",
        items: [
          {
            productVariantId: 1,
            productName: "iPhone 16 Pro Max",
            sku: "IP16PM-512GB-DESERT",
            unitPrice: 100,
            quantity: 1,
          },
        ],
      },
    });
    expect(fakeVoucherRes.status()).toBe(400);

    const invalidPaymentRes = await request.post("/api/orders", {
      data: {
        recipientName: "Khách Hack Payment",
        recipientPhone: "0912345678",
        recipientEmail: "hacker2@test.com",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "123 Phố Lạ",
        paymentMethod: "ONLINE",
        shippingFee: 0,
        items: [
          {
            productVariantId: 1,
            productName: "iPhone 16 Pro Max",
            sku: "IP16PM-512GB-DESERT",
            unitPrice: 100,
            quantity: 1,
          },
        ],
      },
    });
    expect(invalidPaymentRes.status()).toBe(400);

    const productRes = await request.get("/api/products/iphone-16-pro-max");
    const productJson = await productRes.json();
    const availableVariant = (productJson?.data?.variants || []).find((v: any) => v.quantityInStock > 0);
    expect(availableVariant).toBeTruthy();

    const priceTamperRes = await request.post("/api/orders", {
      data: {
        recipientName: "Khách Thử Đổi Giá",
        recipientPhone: "0912345678",
        recipientEmail: "anti_tamper@test.com",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "123 Phố Lạ",
        paymentMethod: "COD",
        shippingFee: 0,
        items: [
          {
            productVariantId: availableVariant.id,
            productName: "iPhone 16 Pro Max",
            sku: availableVariant.sku,
            unitPrice: 1,
            quantity: 1,
          },
        ],
      },
    });
    expect(priceTamperRes.status()).toBe(200);
    const priceTamperData = await priceTamperRes.json();
    const finalTotal = priceTamperData?.data?.totalAmount || priceTamperData?.totalAmount;
    expect(finalTotal).toBe(availableVariant.price);
  });

  test("6. Bảo mật Tra cứu Đơn hàng: Chỉ cho phép tra cứu đơn khách vãng lai, chặn đơn của thành viên và loại bỏ API hủy public", async ({ page, request }) => {
    const userOrderRes = await request.get("/api/manager/orders?pageSize=50");
    const userOrderJson = await userOrderRes.json();
    const registeredOrder = (userOrderJson?.data || []).find((o: any) => o.userId != null);

    if (registeredOrder) {
      const publicLookupAttempt = await request.post("/api/orders/lookup", {
        data: {
          orderNumber: registeredOrder.orderNumber,
          phoneOrEmail: registeredOrder.recipientPhone || registeredOrder.recipientEmail,
        },
      });
      expect(publicLookupAttempt.status()).toBe(404);
    }

    const cancelPublicAttempt = await request.post("/api/orders/lookup/cancel", {
      data: {
        orderNumber: "ORD-FAKE-12345",
        phoneOrEmail: "fake@apple.com",
        reason: "Test",
      },
    });
    expect([404, 405]).toContain(cancelPublicAttempt.status());

    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier", "user@apple-store.com");
    await page.fill("input#password", "User@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/", { timeout: 10000 });

    await expect(page.locator("a[href='/order-lookup']")).toHaveCount(0);

    await page.goto("/order-lookup");
    await page.waitForURL("**/orders", { timeout: 10000 });
    await expect(page.locator("h1:has-text('Đơn hàng của tôi')")).toBeVisible();
  });

  test("7. Thành viên đăng nhập: Đổi địa chỉ nhận hàng (tối đa 1 lần), bảo mật chống hủy đơn chéo tài khoản và hủy đơn khi Chờ xử lý", async ({ page, request }) => {
    const productRes = await request.get("/api/products/iphone-16-pro-max");
    const productJson = await productRes.json();
    const availableVariant = (productJson?.data?.variants || []).find((v: any) => v.quantityInStock > 0);
    const initialStock = availableVariant.quantityInStock;

    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier", "user@apple-store.com");
    await page.fill("input#password", "User@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/", { timeout: 10000 });

    const userLoginRes = await request.post("/api/auth/login", {
      data: { identifier: "user@apple-store.com", password: "User@123456" },
    });
    const userLoginJson = await userLoginRes.json();
    const userToken = userLoginJson?.data?.accessToken || userLoginJson?.accessToken;

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");
    await page.click("[data-testid='add-to-cart-button']");
    await page.waitForTimeout(600);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    await page.fill("input#recipientPhone", "0933221100");
    await page.fill("input#shippingProvince", "Hồ Chí Minh");
    await page.fill("input#shippingAddressLine", "123 Đường Thành Viên Ban Đầu");

    const [createRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(createRes.status()).toBe(200);
    const createData = await createRes.json();
    const newOrderId = createData?.data?.orderId || createData?.orderId;
    const newOrderNumber = createData?.data?.orderNumber || createData?.orderNumber;

    await page.waitForURL("**/checkout/success");

    const unauthCancelRes = await request.post(`/api/orders/${newOrderId}/cancel`, {
      data: { reason: "Kẻ xấu cố tình hủy" },
    });
    expect(unauthCancelRes.status()).toBe(401);

    const adminLoginRes = await request.post("/api/auth/login", {
      data: { identifier: "admin@apple-store.com", password: "Admin@123456" },
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson?.data?.accessToken || adminLoginJson?.accessToken;

    const crossUserCancelRes = await request.post(`/api/orders/${newOrderId}/cancel`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { reason: "User khác cố tình hủy trộm" },
    });
    expect([403, 404]).toContain(crossUserCancelRes.status());

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const orderCard = page.locator(".bg-white", { hasText: newOrderNumber }).first();
    await expect(orderCard).toBeVisible({ timeout: 10000 });

    const viewDetailBtn = orderCard.locator("button:has-text('Xem chi tiết')");
    await viewDetailBtn.click();

    const detailModal = page.locator(".ant-modal", { hasText: newOrderNumber });
    await expect(detailModal).toBeVisible({ timeout: 10000 });

    const editAddressBtn = detailModal.locator("button:has-text('Đổi địa chỉ nhận hàng')");
    await expect(editAddressBtn).toBeVisible();
    await editAddressBtn.click();

    const editAddressModal = page.locator(".ant-modal", { hasText: "Chỉnh sửa thông tin giao nhận" });
    await expect(editAddressModal).toBeVisible();

    await editAddressModal.locator("input#recipientPhone").fill("0987654321");
    await editAddressModal.locator("input#shippingProvince").fill("Hà Nội");
    await editAddressModal.locator("input#shippingAddressLine").fill("Số 99 Phố Tràng Tiền, Hoàn Kiếm");

    const [updateAddressRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes(`/shipping-address`) && res.request().method() === "PUT"),
      editAddressModal.locator("button:has-text('Lưu thay đổi')").click(),
    ]);
    expect(updateAddressRes.status()).toBe(200);

    await expect(detailModal.locator("text=0987654321").first()).toBeVisible({ timeout: 10000 });
    await expect(detailModal.locator("text=Số 99 Phố Tràng Tiền").first()).toBeVisible();
    await expect(detailModal.locator("text=Đã cập nhật địa chỉ (1/1 lần)")).toBeVisible();
    await expect(detailModal.locator("button:has-text('Đổi địa chỉ nhận hàng')")).toHaveCount(0);

    const secondUpdateRes = await request.put(`/api/orders/my-orders/${newOrderId}/shipping-address`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        recipientName: "Test",
        recipientPhone: "0911223344",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "Địa chỉ lần 2 cố tình đổi",
      },
    });
    expect(secondUpdateRes.status()).toBe(400);

    const cancelBtn = detailModal.locator("button:has-text('Hủy đơn hàng')");
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(page.locator(".ant-modal", { hasText: "Lý do hủy đơn hàng" })).toBeVisible();
    await page.click("text=Tôi muốn đổi màu sắc / dung lượng sản phẩm");

    const [cancelRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes(`/api/orders/${newOrderId}/cancel`)),
      page.click(".ant-modal button:has-text('Xác nhận hủy đơn')"),
    ]);
    expect(cancelRes.status()).toBe(200);

    await page.click("button:has-text('Đóng')");

    const afterCancelRes = await request.get("/api/products/iphone-16-pro-max");
    const afterCancelJson = await afterCancelRes.json();
    const stockAfterCancel = (afterCancelJson?.data?.variants || []).find((v: any) => v.id === availableVariant.id)?.quantityInStock;
    expect(stockAfterCancel).toBe(initialStock);
  });

  test("8. Đơn hàng của tôi: Kiểm tra phân trang từ Repository, chuyển tab trạng thái và tìm kiếm đơn hàng", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill("input#identifier", "user@apple-store.com");
    await page.fill("input#password", "User@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/", { timeout: 10000 });

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1:has-text('Đơn hàng của tôi')")).toBeVisible();
    await expect(page.locator(".ant-pagination-total-text")).toBeVisible();

    const tabs = page.locator(".order-tabs");
    await expect(tabs).toBeVisible();
    await expect(tabs.locator("text=Tất cả")).toBeVisible();
    await expect(tabs.locator("text=Chờ xử lý")).toBeVisible();
    await expect(tabs.locator("text=Đã xác nhận")).toBeVisible();
    await expect(tabs.locator("text=Đang giao")).toBeVisible();
    await expect(tabs.locator("text=Đã giao")).toBeVisible();
    await expect(tabs.locator("text=Đã nhận hàng")).toBeVisible();
    await expect(tabs.locator("text=Đã hủy")).toBeVisible();

    const pagination = page.locator(".ant-pagination");
    await expect(pagination).toBeVisible();

    const searchInput = page.locator("input[placeholder*='Tìm theo mã đơn']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("ORD-");
    await page.click("button:has-text('Tìm')");
    await page.waitForLoadState("networkidle");

    await expect(pagination).toBeVisible();
  });
});

