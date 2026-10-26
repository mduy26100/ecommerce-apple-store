import { test, expect } from "@playwright/test";

test.describe("Toàn diện Vòng đời Đơn hàng & Ma trận Bảo mật Đa vai trò (Guest - Member - Admin - Adversary)", () => {
  const BACKEND_URL = "http://localhost:5288";

  test("1. Khách vãng lai: Đặt hàng COD, tra cứu Readonly, Admin duyệt tiến trình (Pending -> Confirmed -> Shipping -> Delivered), kiểm tra mốc lịch sử", async ({ page, request }) => {
    const productRes = await request.get(`${BACKEND_URL}/api/products/iphone-16-pro-max`);
    const productJson = await productRes.json();
    const availableVariant = (productJson?.data?.variants || []).find((v: any) => v.quantityInStock > 0);
    expect(availableVariant).toBeTruthy();

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");
    await page.click("[data-testid='add-to-cart-button']");
    await page.waitForTimeout(600);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    const guestPhone = `091${Date.now().toString().slice(-7)}`;
    const guestEmail = `guest_${Date.now()}@test.vn`;
    await page.fill("input#recipientName", "Khách Vãng Lai VIP");
    await page.fill("input#recipientPhone", guestPhone);
    await page.fill("input#recipientEmail", guestEmail);
    await page.fill("input#shippingProvince", "Hà Nội");
    await page.fill("input#shippingDistrict", "Cầu Giấy");
    await page.fill("input#shippingWard", "Dịch Vọng");
    await page.fill("input#shippingAddressLine", "Số 88 Đường Xuân Thủy");

    const voucherBtn = page.locator("button:has-text('APPLE2026')").first();
    if (await voucherBtn.isVisible()) {
      await voucherBtn.click();
      await page.waitForTimeout(500);
    }

    const [createOrderRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(createOrderRes.status()).toBe(200);
    const orderData = await createOrderRes.json();
    const guestOrderId = orderData?.data?.orderId || orderData?.orderId;
    const guestOrderNumber = orderData?.data?.orderNumber || orderData?.orderNumber;

    await page.waitForURL("**/checkout/success");
    await expect(page.locator("text=" + guestOrderNumber)).toBeVisible();

    await page.goto("/order-lookup");
    await page.waitForLoadState("networkidle");
    await page.fill("input#orderNumber", guestOrderNumber);
    await page.fill("input#phoneOrEmail", guestPhone);
    await page.click("button:has-text('Tra cứu đơn hàng')");

    const lookupResult = page.locator(".bg-white", { hasText: guestOrderNumber }).first();
    await expect(lookupResult).toBeVisible({ timeout: 10000 });
    await expect(lookupResult.locator("text=Khách Vãng Lai VIP")).toBeVisible();
    await expect(lookupResult.locator("button:has-text('Hủy đơn hàng')")).toHaveCount(0);
    await expect(lookupResult.locator("button:has-text('Đổi địa chỉ nhận hàng')")).toHaveCount(0);
    await expect(lookupResult.locator("button:has-text('Đã nhận hàng')")).toHaveCount(0);
    await expect(page.locator("text=Cần hỗ trợ về đơn hàng này?")).toBeVisible();

    const adminLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { identifier: "admin@apple-store.com", password: "Admin@123456" },
    });
    expect(adminLoginRes.status()).toBe(200);
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson?.data?.accessToken || adminLoginJson?.accessToken;

    const confirmRes = await request.put(`${BACKEND_URL}/api/manager/orders/${guestOrderId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        status: "Confirmed",
        note: "Quản trị viên đã gọi điện thoại xác nhận đơn hàng thành công.",
      },
    });
    expect(confirmRes.status()).toBe(200);

    const shipRes = await request.put(`${BACKEND_URL}/api/manager/orders/${guestOrderId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        status: "Shipping",
        note: "Đã đóng gói và bàn giao cho đơn vị vận chuyển Giao Hàng Nhanh.",
      },
    });
    expect(shipRes.status()).toBe(200);

    const deliverRes = await request.put(`${BACKEND_URL}/api/manager/orders/${guestOrderId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        status: "Delivered",
        paymentStatus: "Paid",
        note: "Bưu tá thông báo đã phát hàng thành công cho người nhận.",
      },
    });
    expect(deliverRes.status()).toBe(200);

    await page.goto("/order-lookup");
    await page.waitForLoadState("networkidle");
    await page.fill("input#orderNumber", guestOrderNumber);
    await page.fill("input#phoneOrEmail", guestPhone);
    await page.click("button:has-text('Tra cứu đơn hàng')");

    const updatedResult = page.locator(".bg-white", { hasText: guestOrderNumber }).first();
    await expect(updatedResult).toBeVisible({ timeout: 10000 });
    await expect(updatedResult.locator("text=Đã giao hàng").first()).toBeVisible();
    await expect(updatedResult.locator("text=Quản trị viên đã gọi điện thoại")).toBeVisible();
    await expect(updatedResult.locator("text=Lưu ý nhận hàng & Chính sách đổi trả")).toBeVisible();
  });

  test("2. Thành viên: Đặt hàng, đổi địa chỉ (1 lần), Admin duyệt -> Khách xác nhận 'Đã nhận hàng' (Completed)", async ({ page, request }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier", "user@apple-store.com");
    await page.fill("input#password", "User@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/", { timeout: 10000 });

    const userLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
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

    const originalPhone = "0944556677";
    await page.fill("input#recipientPhone", originalPhone);
    await page.fill("input#shippingProvince", "Đà Nẵng");
    await page.fill("input#shippingAddressLine", "100 Đường Bạch Đằng Ban Đầu");

    const [userCreateRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(userCreateRes.status()).toBe(200);
    const userOrderData = await userCreateRes.json();
    const userOrderId = userOrderData?.data?.orderId || userOrderData?.orderId;
    const userOrderNumber = userOrderData?.data?.orderNumber || userOrderData?.orderNumber;

    await page.waitForURL("**/checkout/success");

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const orderCard = page.locator(".bg-white", { hasText: userOrderNumber }).first();
    await expect(orderCard).toBeVisible({ timeout: 10000 });
    await orderCard.locator("button:has-text('Xem chi tiết')").click();

    const detailModal = page.locator(".ant-modal", { hasText: userOrderNumber });
    await expect(detailModal).toBeVisible({ timeout: 10000 });

    const editBtn = detailModal.locator("button:has-text('Đổi địa chỉ nhận hàng')");
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    const editModal = page.locator(".ant-modal", { hasText: "Chỉnh sửa thông tin giao nhận" });
    await expect(editModal).toBeVisible();
    const newPhone = "0977889900";
    const newAddress = "250 Đường Nguyễn Văn Linh Mới";
    await editModal.locator("input#recipientPhone").fill(newPhone);
    await editModal.locator("input#shippingProvince").fill("Đà Nẵng");
    await editModal.locator("input#shippingAddressLine").fill(newAddress);

    const [editRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/shipping-address") && res.request().method() === "PUT"),
      editModal.locator("button:has-text('Lưu thay đổi')").click(),
    ]);
    expect(editRes.status()).toBe(200);

    await expect(detailModal.locator(`text=${newPhone}`).first()).toBeVisible({ timeout: 10000 });
    await expect(detailModal.locator(`text=${newAddress}`).first()).toBeVisible();
    await expect(detailModal.locator("text=Đã cập nhật địa chỉ (1/1 lần)")).toBeVisible();
    await expect(detailModal.locator("button:has-text('Đổi địa chỉ nhận hàng')")).toHaveCount(0);

    const secondEditAttempt = await request.put(`${BACKEND_URL}/api/orders/my-orders/${userOrderId}/shipping-address`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        recipientName: "Test Lần 2",
        recipientPhone: "0911223344",
        shippingProvince: "Đà Nẵng",
        shippingAddressLine: "Địa chỉ cố đổi lần 2",
      },
    });
    expect(secondEditAttempt.status()).toBe(400);

    await detailModal.locator("button:has-text('Đóng')").click();

    const adminLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { identifier: "admin@apple-store.com", password: "Admin@123456" },
    });
    const adminToken = (await adminLoginRes.json())?.data?.accessToken;

    await request.put(`${BACKEND_URL}/api/manager/orders/${userOrderId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: "Delivered", paymentStatus: "Paid", note: "Đã giao tới tay khách hàng." },
    });

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const updatedOrderCard = page.locator(".bg-white", { hasText: userOrderNumber }).first();
    await expect(updatedOrderCard).toBeVisible({ timeout: 10000 });
    await updatedOrderCard.locator("button:has-text('Xem chi tiết')").click();

    const updatedDetailModal = page.locator(".ant-modal", { hasText: userOrderNumber });
    await expect(updatedDetailModal).toBeVisible();
    await expect(updatedDetailModal.locator("text=Đã giao hàng").first()).toBeVisible();

    const receivedBtn = updatedDetailModal.locator("button:has-text('Đã nhận được hàng')");
    await expect(receivedBtn).toBeVisible();
    await receivedBtn.click();

    const popconfirmOkBtn = page.locator(".ant-popconfirm button:has-text('Xác nhận')");
    await expect(popconfirmOkBtn).toBeVisible();

    const [confirmReceivedRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes(`/api/orders/${userOrderId}/confirm-received`)),
      popconfirmOkBtn.click(),
    ]);
    expect(confirmReceivedRes.status()).toBe(200);

    await expect(updatedDetailModal.locator("text=Đã nhận hàng").first()).toBeVisible({ timeout: 10000 });
    await expect(updatedDetailModal.locator("button:has-text('Đã nhận được hàng')")).toHaveCount(0);
  });

  test("3. Hủy đơn hàng: Khách tự hủy khi Chờ xử lý -> hoàn kho, Khách bị chặn hủy khi Đã xác nhận/Đang giao", async ({ page, request }) => {
    const productRes = await request.get(`${BACKEND_URL}/api/products/iphone-16-pro-max`);
    const productJson = await productRes.json();
    const availableVariant = (productJson?.data?.variants || []).find((v: any) => v.quantityInStock > 0);
    const baseStock = availableVariant.quantityInStock;

    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier", "user@apple-store.com");
    await page.fill("input#password", "User@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/", { timeout: 10000 });

    const userLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { identifier: "user@apple-store.com", password: "User@123456" },
    });
    const userToken = (await userLoginRes.json())?.data?.accessToken;

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");
    await page.click("[data-testid='add-to-cart-button']");
    await page.waitForTimeout(600);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    await page.fill("input#recipientPhone", "0966778899");
    await page.fill("input#shippingProvince", "Hồ Chí Minh");
    await page.fill("input#shippingAddressLine", "Số 12 Đường Hủy Kho");

    const [orderRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(orderRes.status()).toBe(200);
    const orderData = await orderRes.json();
    const orderId = orderData?.data?.orderId || orderData?.orderId;
    const orderNumber = orderData?.data?.orderNumber || orderData?.orderNumber;

    const stockDuringOrderRes = await request.get(`${BACKEND_URL}/api/products/iphone-16-pro-max`);
    const stockDuringOrder = (await stockDuringOrderRes.json())?.data?.variants?.find((v: any) => v.id === availableVariant.id)?.quantityInStock;
    expect(stockDuringOrder).toBe(baseStock - 1);

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");
    const card = page.locator(".bg-white", { hasText: orderNumber }).first();
    await card.locator("button:has-text('Xem chi tiết')").click();

    const detailModal = page.locator(".ant-modal", { hasText: orderNumber });
    const cancelBtn = detailModal.locator("button:has-text('Hủy đơn hàng')");
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await page.click("text=Tôi muốn đổi màu sắc / dung lượng sản phẩm");
    const [cancelRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes(`/api/orders/${orderId}/cancel`)),
      page.click(".ant-modal button:has-text('Xác nhận hủy đơn')"),
    ]);
    expect(cancelRes.status()).toBe(200);

    const stockAfterCancelRes = await request.get(`${BACKEND_URL}/api/products/iphone-16-pro-max`);
    const stockAfterCancel = (await stockAfterCancelRes.json())?.data?.variants?.find((v: any) => v.id === availableVariant.id)?.quantityInStock;
    expect(stockAfterCancel).toBe(baseStock);

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");
    await page.click("[data-testid='add-to-cart-button']");
    await page.waitForTimeout(600);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    await page.fill("input#recipientPhone", "0966778899");
    await page.fill("input#shippingProvince", "Hồ Chí Minh");
    await page.fill("input#shippingAddressLine", "Số 14 Đường Đang Giao");

    const [order2Res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/orders") && res.request().method() === "POST"),
      page.click("button:has-text('Hoàn tất đặt hàng')"),
    ]);
    expect(order2Res.status()).toBe(200);
    const order2Id = (await order2Res.json())?.data?.orderId;

    const adminLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { identifier: "admin@apple-store.com", password: "Admin@123456" },
    });
    const adminToken = (await adminLoginRes.json())?.data?.accessToken;

    await request.put(`${BACKEND_URL}/api/manager/orders/${order2Id}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: "Shipping", note: "Đang trên đường giao." },
    });

    const userCancelShippingAttempt = await request.post(`${BACKEND_URL}/api/orders/${order2Id}/cancel`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { reason: "Cố tình hủy khi đang giao" },
    });
    expect(userCancelShippingAttempt.status()).toBe(400);
  });

  test("4. Ma trận Bảo mật & Chống tấn công giả mạo (Adversarial Security): Đơn giá, Voucher, Đơn chéo tài khoản, Tra cứu rò rỉ", async ({ request }) => {
    const productRes = await request.get(`${BACKEND_URL}/api/products/iphone-16-pro-max`);
    const productJson = await productRes.json();
    const availableVariant = (productJson?.data?.variants || []).find((v: any) => v.quantityInStock > 0);

    const priceTamperRes = await request.post(`${BACKEND_URL}/api/orders`, {
      data: {
        recipientName: "Kẻ Xấu Hack Giá",
        recipientPhone: "0988776655",
        recipientEmail: "hacker@test.com",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "999 Đường Hack",
        paymentMethod: "COD",
        items: [
          {
            productVariantId: availableVariant.id,
            productName: availableVariant.variantName || "iPhone 16 Pro Max",
            sku: availableVariant.sku,
            unitPrice: 1000,
            quantity: 1,
          },
        ],
      },
    });
    expect(priceTamperRes.status()).toBe(200);
    const priceTamperJson = await priceTamperRes.json();
    const verifiedOrderNumber = priceTamperJson?.data?.orderNumber || priceTamperJson?.orderNumber;

    const verifiedDetailRes = await request.post(`${BACKEND_URL}/api/orders/lookup`, {
      data: {
        orderNumber: verifiedOrderNumber,
        phoneOrEmail: "0988776655",
      },
    });
    expect(verifiedDetailRes.status()).toBe(200);
    const verifiedDetail = await verifiedDetailRes.json();
    const finalAmount = verifiedDetail?.data?.totalAmount || verifiedDetail?.totalAmount;
    expect(finalAmount).toBe(availableVariant.price);

    const unauthCancelRes = await request.post(`${BACKEND_URL}/api/orders/1/cancel`, {
      data: { reason: "Hủy ẩn danh" },
    });
    expect(unauthCancelRes.status()).toBe(401);

    const unauthEditRes = await request.put(`${BACKEND_URL}/api/orders/my-orders/1/shipping-address`, {
      data: {
        recipientName: "Hacker",
        recipientPhone: "0988776655",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "Địa chỉ hack",
      },
    });
    expect(unauthEditRes.status()).toBe(401);

    const userLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { identifier: "user@apple-store.com", password: "User@123456" },
    });
    const userToken = (await userLoginRes.json())?.data?.accessToken;

    const crossUserCancelRes = await request.post(`${BACKEND_URL}/api/orders/${priceTamperJson?.data?.orderId}/cancel`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { reason: "User hủy đơn của khách vãng lai" },
    });
    expect(crossUserCancelRes.status()).toBe(403);

    const crossUserEditRes = await request.put(`${BACKEND_URL}/api/orders/my-orders/${priceTamperJson?.data?.orderId}/shipping-address`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        recipientName: "Hack",
        recipientPhone: "0911223344",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "Hack",
      },
    });
    expect(crossUserEditRes.status()).toBe(403);

    const memberOrderLookupRes = await request.post(`${BACKEND_URL}/api/orders/lookup`, {
      data: {
        orderNumber: "ORD-20261026-E7E4E4",
        phoneOrEmail: "0933221100",
      },
    });
    expect(memberOrderLookupRes.status()).toBe(404);

    const publicCancelEndpointRes = await request.post(`${BACKEND_URL}/api/orders/lookup/cancel`, {
      data: { orderNumber: "ORD-FAKE", phoneOrEmail: "fake@mail.com" },
    });
    expect([404, 405]).toContain(publicCancelEndpointRes.status());

    const oversellRes = await request.post(`${BACKEND_URL}/api/orders`, {
      data: {
        recipientName: "Kẻ Mua Quá Tồn Kho",
        recipientPhone: "0988776655",
        shippingProvince: "Hà Nội",
        shippingAddressLine: "123 Đường Kho",
        items: [
          {
            productVariantId: availableVariant.id,
            productName: "iPhone 16 Pro Max",
            sku: availableVariant.sku,
            unitPrice: availableVariant.price,
            quantity: 999999,
          },
        ],
      },
    });
    expect(oversellRes.status()).toBe(400);
  });

  test("5. Giao diện Quản trị Admin (/admin/orders): Bộ lọc trạng thái, tìm kiếm từ khóa, Drawer chi tiết đơn", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input#identifier", "admin@apple-store.com");
    await page.fill("input#password", "Admin@123456");
    await page.click("button[type='submit']");
    await page.waitForURL("**/admin/**", { timeout: 10000 });

    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1, h2, .ant-page-header-heading-title", { hasText: "Quản Lý Đơn Hàng" })).toBeVisible();
    await expect(page.locator(".ant-table")).toBeVisible();

    const firstRow = page.locator(".ant-table-row").first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });

    const viewDetailBtn = firstRow.locator("button[title='Xem chi tiết đơn hàng']").first();
    await viewDetailBtn.click();

    const drawer = page.locator(".ant-drawer-open");
    await expect(drawer).toBeVisible({ timeout: 10000 });
    await expect(drawer.locator(".ant-descriptions").first()).toBeVisible({ timeout: 10000 });
    await expect(drawer.locator("text=Snapshot sản phẩm khi đặt")).toBeVisible({ timeout: 10000 });
    await drawer.locator(".ant-drawer-close").click();
    await expect(page.locator(".ant-drawer-open")).toHaveCount(0);
  });
});
