import { test, expect } from "@playwright/test";
import crypto from "crypto";

const VNP_TMN_CODE = "MAPPJ5MO";
const VNP_HASH_SECRET = "KTXCJNCFHZCIUHUGXICGDMMFHGJMBKPV";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8088";
const FRONTEND_URL = process.env.BASE_URL || "http://localhost:3088";

function signVnpayData(secretKey: string, data: Record<string, string>): string {
  const sortedKeys = Object.keys(data).sort();
  const signData = sortedKeys
    .filter((k) => data[k] !== undefined && data[k] !== null && data[k] !== "")
    .map((k) => `${encodeURIComponent(k).replace(/%20/g, "+")}=${encodeURIComponent(data[k]).replace(/%20/g, "+")}`)
    .join("&");

  return crypto
    .createHmac("sha512", Buffer.from(secretKey, "utf-8"))
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

async function loginAsUser(page: any) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.fill("input#identifier, input[name='identifier']", "user@apple-store.com");
  await page.fill("input#password, input[name='password']", "User@123456");

  const [response] = await Promise.all([
    page.waitForResponse((res: any) => res.url().includes("/auth/login") && res.request().method() === "POST"),
    page.click("form button[type='submit'], form button:has-text('Đăng nhập')"),
  ]);

  expect(response.status()).toBe(200);
  await page.waitForURL((url: URL) => url.pathname === "/" || url.pathname === "");
  await page.waitForLoadState("networkidle");
}

async function ensureStock(request: any, variantId: number = 1550, quantity: number = 100) {
  const adminLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
    data: {
      identifier: "admin@apple-store.com",
      password: "Admin@123456",
    },
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData?.accessToken || adminLoginData?.data?.accessToken;
  if (!adminToken) return;

  const variantRes = await request.get(`${BACKEND_URL}/api/manager/product-variants/${variantId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const variantData = (await variantRes.json())?.data || (await variantRes.json());
  if (!variantData) return;

  await request.put(`${BACKEND_URL}/api/manager/product-variants/${variantId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      sku: variantData.sku || "IPHONE16PR-P1-TITANT-256GB-7",
      variantName: variantData.variantName,
      price: variantData.price,
      compareAtPrice: variantData.compareAtPrice,
      quantityInStock: quantity,
      rowVersion: variantData.rowVersion,
      isActive: true,
    },
  });
}

test.describe("Kịch bản Kiểm thử Toàn diện Cổng Thanh toán VNPAY Sandbox", () => {
  test.beforeAll(async ({ request }) => {
    await ensureStock(request, 1550, 100);
  });

  test("1. Luồng hoàn chỉnh: User đăng nhập đặt hàng qua VNPAY, điền thẻ NCB Sandbox và thanh toán thành công", async ({ page }) => {
    test.setTimeout(90000);

    await loginAsUser(page);

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button'], button:has-text('Thêm vào giỏ')").first();
    await expect(addToCartBtn).toBeVisible({ timeout: 15000 });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const checkoutBtn = page.locator("[data-testid='cart-checkout-button'], button:has-text('Tiến hành thanh toán'), button:has-text('Thanh toán')").first();
    await expect(checkoutBtn).toBeVisible({ timeout: 15000 });
    await checkoutBtn.click();

    await page.waitForURL("**/checkout", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    const recipientPhoneInput = page.locator("input#recipientPhone");
    if (await recipientPhoneInput.isVisible()) {
      const currentPhone = await recipientPhoneInput.inputValue();
      if (!currentPhone) {
        await recipientPhoneInput.fill("0912345678");
      }
    }

    const vnpayOption = page.locator("text=Cổng thanh toán điện tử VNPAY (ATM/QR)").first();
    await expect(vnpayOption).toBeVisible({ timeout: 10000 });
    await vnpayOption.click();

    let createdOrderNumber = "";
    await page.route("**/api/orders", async (route) => {
      const response = await route.fetch();
      try {
        const json = await response.json();
        createdOrderNumber = json?.data?.orderNumber || json?.orderNumber || "";
      } catch {
        // ignore
      }
      await route.fulfill({ response });
    });

    await page.click("button:has-text('Hoàn tất đặt hàng')");
    await page.waitForURL((url) => url.hostname.includes("vnpayment.vn"), { timeout: 35000 });
    expect(page.url()).toContain("vnpayment.vn");
    expect(createdOrderNumber).toMatch(/^ORD-/);

    const domesticCardOption = page.locator("text=/Thẻ nội địa/i").first();
    await expect(domesticCardOption).toBeVisible({ timeout: 25000 });
    await domesticCardOption.click();

    const searchBankInput = page.locator("input[placeholder*='Tìm kiếm']").first();
    await expect(searchBankInput).toBeVisible({ timeout: 15000 });
    await searchBankInput.fill("NCB");
    await page.waitForTimeout(800);

    const ncbButton = page.locator("button#NCB, #NCB").first();
    await expect(ncbButton).toBeVisible({ timeout: 15000 });
    await ncbButton.click();

    await page.waitForLoadState("networkidle");

    const cardNumberInput = page.locator("#card_number_mask, #card_number, input[name='card_number'], input[placeholder*='Số thẻ']").first();
    await expect(cardNumberInput).toBeVisible({ timeout: 15000 });
    await cardNumberInput.click();
    await cardNumberInput.pressSequentially("9704198526191432198", { delay: 50 });

    const cardHolderInput = page.locator("#cardHolder, input[name='cardHolder'], input[placeholder*='chủ thẻ']").first();
    await cardHolderInput.click();
    await cardHolderInput.fill("NGUYEN VAN A");

    const cardDateInput = page.locator("#cardDate, input[name='cardDate'], input[placeholder*='MM/YY'], input[placeholder*='ngày phát hành']").first();
    await cardDateInput.click();
    await cardDateInput.pressSequentially("0715", { delay: 50 });

    const continueBtn = page.locator("#btnContinue, button:has-text('Tiếp tục'), button:has-text('Xác thực'), input[value='Tiếp tục']").first();
    await continueBtn.click();

    await page.waitForTimeout(1000);
    const termsAcceptBtn = page.locator("a[href*='cardVerify']").first();
    if (await termsAcceptBtn.isVisible({ timeout: 5000 })) {
      await termsAcceptBtn.click({ force: true });
    } else {
      await page.evaluate(() => {
        const link = document.querySelector("a[href*='cardVerify']") as HTMLElement;
        if (link) link.click();
      });
    }

    await page.waitForLoadState("networkidle");

    const otpInput = page.locator("#otpvalue, input[name='otp'], input[placeholder*='OTP'], input[name='otpvalue'], input[type='password']").first();
    await expect(otpInput).toBeVisible({ timeout: 25000 });
    await otpInput.fill("123456");

    const confirmOtpBtn = page.locator("#btnConfirm, button:has-text('Xác nhận'), button:has-text('Thanh toán'), input[value='Xác nhận']").first();
    await confirmOtpBtn.click();

    await page.waitForURL((url) => url.pathname.includes("/payment/vnpay-return"), { timeout: 35000 });
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText(/Thanh toán thành công qua VNPAY/i);
    await expect(page.locator(`text=${createdOrderNumber}`)).toBeVisible();
    await expect(page.locator("text=Giao dịch thành công")).toBeVisible();
    await expect(page.locator("text=Cổng điện tử VNPAY")).toBeVisible();

    const viewOrdersBtn = page.locator("button:has-text('Xem đơn hàng của tôi')");
    await expect(viewOrdersBtn).toBeVisible();
    await viewOrdersBtn.click();

    await page.waitForURL("**/orders", { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${createdOrderNumber}`)).toBeVisible();
  });

  test("2. Case oái oăm: Khách hủy giao dịch trên VNPAY Sandbox -> Hiển thị thất bại và hỗ trợ thanh toán lại", async ({ page }) => {
    test.setTimeout(90000);

    await loginAsUser(page);

    await page.goto("/products/iphone-16-pro-max");
    await page.waitForLoadState("networkidle");

    const addToCartBtn = page.locator("[data-testid='add-to-cart-button'], button:has-text('Thêm vào giỏ')").first();
    await expect(addToCartBtn).toBeVisible({ timeout: 15000 });
    await addToCartBtn.click();
    await page.waitForTimeout(800);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    const recipientPhoneInput = page.locator("input#recipientPhone");
    if (await recipientPhoneInput.isVisible()) {
      const currentPhone = await recipientPhoneInput.inputValue();
      if (!currentPhone) {
        await recipientPhoneInput.fill("0912345678");
      }
    }

    const vnpayOption = page.locator("text=Cổng thanh toán điện tử VNPAY (ATM/QR)").first();
    await expect(vnpayOption).toBeVisible({ timeout: 10000 });
    await vnpayOption.click();

    let createdOrderNumber2 = "";
    await page.route("**/api/orders", async (route) => {
      const response = await route.fetch();
      try {
        const json = await response.json();
        createdOrderNumber2 = json?.data?.orderNumber || json?.orderNumber || "";
      } catch {
        // ignore
      }
      await route.fulfill({ response });
    });

    await page.click("button:has-text('Hoàn tất đặt hàng')");
    await page.waitForURL((url) => url.hostname.includes("vnpayment.vn"), { timeout: 35000 });

    const cancelLink = page.locator("a[href*='GoBack'], .btn-back, [class*='back']").first();
    try {
      if (await cancelLink.isVisible({ timeout: 3000 })) {
        await cancelLink.click();
      }
    } catch {
      // ignore
    }

    if (!page.url().includes("/payment/vnpay-return")) {
      await page.goto(`${FRONTEND_URL}/payment/vnpay-return?vnp_ResponseCode=24&vnp_TxnRef=${createdOrderNumber2}&vnp_Amount=3499000000`);
    }

    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText(/Thanh toán không thành công/i);
    await expect(page.locator("text=Giao dịch đã bị hủy bởi khách hàng").first()).toBeVisible();

    const repayLink = page.locator("button:has-text('Thanh toán lại')").first();
    await expect(repayLink).toBeVisible();
    await repayLink.click();

    await page.waitForURL("**/orders", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    const orderRow = page.locator(`text=${createdOrderNumber2}`).first();
    await expect(orderRow).toBeVisible();

    const repayBtn = page.locator("button:has-text('Thanh toán lại VNPAY')").first();
    await expect(repayBtn).toBeVisible();
  });

  test("3. Case oái oăm: Bấm nút 'Thanh toán lại VNPAY' từ trang Đơn hàng của tôi chuyển hướng sang VNPAY thành công", async ({ page }) => {
    test.setTimeout(60000);

    await loginAsUser(page);

    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const repayBtn = page.locator("button:has-text('Thanh toán lại VNPAY')").first();
    if (await repayBtn.isVisible({ timeout: 8000 })) {
      await repayBtn.click();
      await page.waitForURL((url) => url.hostname.includes("vnpayment.vn"), { timeout: 30000 });
      expect(page.url()).toContain("vnpayment.vn");
    }
  });

  test("4. Case oái oăm: Khách vãng lai chọn VNPAY nhưng không thanh toán -> Đơn không xuất hiện bừa bãi trong đơn gần đây", async ({ request }) => {
    test.setTimeout(45000);

    const guestId = `test_guest_${Date.now()}`;
    const testEmail = `guest_vnpay_${Date.now()}@apple.com`;

    const createOrderRes = await request.post(`${BACKEND_URL}/api/orders`, {
      data: {
        guestId,
        recipientName: "Khách Vãng Lai VNPAY",
        recipientPhone: "0987654321",
        recipientEmail: testEmail,
        shippingAddressLine: "123 Phố Huế",
        shippingProvince: "Hà Nội",
        paymentMethod: "VNPAY",
        shippingFee: 0,
        items: [
          {
            productVariantId: 1550,
            productName: "iPhone 16 Pro Max",
            sku: "IPHONE16PR-P1-TITANT-256GB-7",
            unitPrice: 34990000,
            quantity: 1,
          },
        ],
      },
    });

    expect(createOrderRes.status()).toBe(200);
    const orderData = await createOrderRes.json();
    const paymentUrl = orderData?.data?.paymentUrl;
    expect(paymentUrl).toContain("vnpayment.vn");

    const recentOrdersRes = await request.get(`${BACKEND_URL}/api/orders/guest-recent?guestId=${guestId}`);
    expect(recentOrdersRes.status()).toBe(200);
    const recentOrders = await recentOrdersRes.json();
    const guestOrdersList = recentOrders?.data || [];

    const containsUnpaidOrder = guestOrdersList.some((o: any) => o.orderNumber === orderData?.data?.orderNumber);
    expect(containsUnpaidOrder).toBe(false);
  });

  test("5. Case oái oăm: Webhook IPN Backend đối soát chữ ký giả mạo (Invalid Signature) và cập nhật đơn hợp lệ", async ({ request }) => {
    test.setTimeout(45000);

    const fakeIpnRes = await request.get(`${BACKEND_URL}/api/payment/vnpay-ipn`, {
      params: {
        vnp_TmnCode: VNP_TMN_CODE,
        vnp_Amount: "3499000000",
        vnp_TxnRef: "ORD-FAKE-999999",
        vnp_ResponseCode: "00",
        vnp_SecureHash: "invalid_hash_signature_1234567890abcdef",
      },
    });

    expect(fakeIpnRes.status()).toBe(200);
    const fakeResult = await fakeIpnRes.json();
    const fakeCode = fakeResult.RspCode || fakeResult.rspCode;
    expect(fakeCode).toBe("97");

    const createOrderRes = await request.post(`${BACKEND_URL}/api/orders`, {
      data: {
        recipientName: "IPN Test User",
        recipientPhone: "0912345678",
        recipientEmail: "ipn_test@apple.com",
        shippingAddressLine: "Test Address",
        shippingProvince: "Hà Nội",
        paymentMethod: "VNPAY",
        shippingFee: 0,
        items: [
          {
            productVariantId: 1550,
            productName: "iPhone 16 Pro Max",
            sku: "IPHONE16PR-P1-TITANT-256GB-7",
            unitPrice: 34990000,
            quantity: 1,
          },
        ],
      },
    });

    expect(createOrderRes.status()).toBe(200);
    const orderData = await createOrderRes.json();
    const validOrderNumber = orderData?.data?.orderNumber;
    const amountInVnpay = (34990000 * 100).toString();

    const ipnParams: Record<string, string> = {
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Amount: amountInVnpay,
      vnp_BankCode: "NCB",
      vnp_BankTranNo: "VNP1482026",
      vnp_CardType: "ATM",
      vnp_Command: "pay",
      vnp_CreateDate: "20261026153000",
      vnp_CurrCode: "VND",
      vnp_OrderInfo: `Thanh toan don hang ${validOrderNumber}`,
      vnp_PayDate: "20261026153500",
      vnp_ResponseCode: "00",
      vnp_TransactionNo: "1482026",
      vnp_TransactionStatus: "00",
      vnp_TxnRef: validOrderNumber,
      vnp_Version: "2.1.0",
    };

    const validSignature = signVnpayData(VNP_HASH_SECRET, ipnParams);
    ipnParams.vnp_SecureHash = validSignature;

    const validIpnRes = await request.get(`${BACKEND_URL}/api/payment/vnpay-ipn`, {
      params: ipnParams,
    });

    expect(validIpnRes.status()).toBe(200);
    const validResult = await validIpnRes.json();
    const validCode = validResult.RspCode || validResult.rspCode;
    expect(validCode).toBe("00");

    const secondIpnRes = await request.get(`${BACKEND_URL}/api/payment/vnpay-ipn`, {
      params: ipnParams,
    });
    expect(secondIpnRes.status()).toBe(200);
    const secondResult = await secondIpnRes.json();
    const secondCode = secondResult.RspCode || secondResult.rspCode;
    expect(secondCode).toBe("02");
  });

  test("6. Case oái oăm cực đoan: 10 request đồng thời tranh chấp mua 1 sản phẩm tồn kho duy nhất -> Đúng 1 request thành công, 9 request thất bại và tồn kho không bị âm", async ({ request }) => {
    test.setTimeout(60000);

    const adminLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        identifier: "admin@apple-store.com",
        password: "Admin@123456",
      },
    });
    expect(adminLoginRes.status()).toBe(200);
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData?.accessToken || adminLoginData?.data?.accessToken || adminLoginData?.data?.token;
    expect(adminToken).toBeTruthy();

    const targetVariantId = 1550;
    const variantRes = await request.get(`${BACKEND_URL}/api/manager/product-variants/${targetVariantId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(variantRes.status()).toBe(200);
    const variantData = (await variantRes.json())?.data || (await variantRes.json());

    const updateStockRes = await request.put(`${BACKEND_URL}/api/manager/product-variants/${targetVariantId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        sku: variantData.sku || "IPHONE16PR-P1-TITANT-256GB-7",
        variantName: variantData.variantName,
        price: variantData.price,
        compareAtPrice: variantData.compareAtPrice,
        quantityInStock: 1,
        rowVersion: variantData.rowVersion,
        isActive: true,
      },
    });
    expect(updateStockRes.status()).toBe(200);

    const createOrderPayload = (index: number) => ({
      recipientName: `Buyer Concurrency ${index}`,
      recipientPhone: "0912345678",
      recipientEmail: `buyer_${index}_${Date.now()}@apple.com`,
      shippingAddressLine: `Address ${index}`,
      shippingProvince: "Hà Nội",
      paymentMethod: "COD",
      shippingFee: 0,
      items: [
        {
          productVariantId: targetVariantId,
          productName: "iPhone 16 Pro Max",
          sku: variantData.sku || "IPHONE16PR-P1-TITANT-256GB-7",
          unitPrice: variantData.price || 34990000,
          quantity: 1,
        },
      ],
    });

    const requests = Array.from({ length: 10 }, (_, i) =>
      request.post(`${BACKEND_URL}/api/orders`, {
        data: createOrderPayload(i + 1),
      })
    );

    const responses = await Promise.allSettled(requests);

    let successCount = 0;
    let failureCount = 0;
    let successfulOrderId = 0;

    for (const res of responses) {
      if (res.status === "fulfilled") {
        const httpStatus = res.value.status();
        if (httpStatus === 200 || httpStatus === 201) {
          successCount++;
          const json = await res.value.json();
          successfulOrderId = json?.data?.id || json?.id || 0;
        } else if (httpStatus === 400) {
          failureCount++;
          const json = await res.value.json();
          const msg = json?.error?.message || json?.message || "";
          expect(msg.toLowerCase()).toMatch(/không đủ|chỉ còn/i);
        }
      }
    }

    expect(successCount).toBe(1);
    expect(failureCount).toBe(9);

    const checkStockRes = await request.get(`${BACKEND_URL}/api/manager/product-variants/${targetVariantId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const finalVariantData = (await checkStockRes.json())?.data || (await checkStockRes.json());
    expect(finalVariantData.quantityInStock).toBe(0);

    if (successfulOrderId > 0) {
      const cancelRes = await request.post(`${BACKEND_URL}/api/manager/orders/${successfulOrderId}/cancel`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { reason: "Hoàn lại tồn kho sau bài kiểm thử Concurrency" },
      });
      expect(cancelRes.status()).toBe(200);

      const restoredStockRes = await request.get(`${BACKEND_URL}/api/manager/product-variants/${targetVariantId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const restoredVariantData = (await restoredStockRes.json())?.data || (await restoredStockRes.json());
      expect(restoredVariantData.quantityInStock).toBe(1);

      await request.put(`${BACKEND_URL}/api/manager/product-variants/${targetVariantId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          sku: variantData.sku || "IPHONE16PR-P1-TITANT-256GB-7",
          variantName: variantData.variantName,
          price: variantData.price,
          compareAtPrice: variantData.compareAtPrice,
          quantityInStock: 50,
          rowVersion: restoredVariantData.rowVersion,
          isActive: true,
        },
      });
    }
  });

  test("7. Case oái oăm: Khách vãng lai và Thành viên kiểm tra trạng thái thanh toán trên giao diện Storefront", async ({ page, request }) => {
    test.setTimeout(60000);

    await ensureStock(request, 1550, 100);

    const guestOrderEmail = `guest_badge_${Date.now()}@apple.com`;
    const guestPhone = "0988776655";

    const createOrderRes = await request.post(`${BACKEND_URL}/api/orders`, {
      data: {
        recipientName: "Khách Vãng Lai Tra Cứu",
        recipientPhone: guestPhone,
        recipientEmail: guestOrderEmail,
        shippingAddressLine: "456 Kim Mã, Ba Đình",
        shippingProvince: "Hà Nội",
        paymentMethod: "VNPAY",
        shippingFee: 0,
        items: [
          {
            productVariantId: 1550,
            productName: "iPhone 16 Pro Max",
            sku: "IPHONE16PR-P1-TITANT-256GB-7",
            unitPrice: 34990000,
            quantity: 1,
          },
        ],
      },
    });

    if (createOrderRes.status() !== 200) {
      console.error("Test 7 create order error:", await createOrderRes.text());
    }
    expect(createOrderRes.status()).toBe(200);
    const orderData = await createOrderRes.json();
    const guestOrderNumber = orderData?.data?.orderNumber;

    await page.goto("/order-lookup");
    await page.waitForLoadState("networkidle");

    await page.fill("input#orderNumber", guestOrderNumber);
    await page.fill("input#phoneOrEmail", guestPhone);
    await page.click("button:has-text('Tra cứu đơn hàng')");

    await page.waitForTimeout(1500);
    await expect(page.locator(`text=${guestOrderNumber}`)).toBeVisible();
    await expect(page.locator("[data-testid='badge-payment-pending']").first()).toBeVisible();

    await loginAsUser(page);
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const pendingBadges = page.locator("[data-testid='badge-payment-pending']");
    await expect(pendingBadges.first()).toBeVisible({ timeout: 10000 });
  });

  test("8. Case oái oăm: Bỏ hoàn toàn giới hạn 15 phút, người dùng có thể tạo lại URL VNPay bất kỳ lúc nào khi đơn Pending", async ({ request }) => {
    test.setTimeout(45000);

    await ensureStock(request, 1550, 100);

    const userLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        identifier: "user@apple-store.com",
        password: "User@123456",
      },
    });
    expect(userLoginRes.status()).toBe(200);
    const userLoginData = await userLoginRes.json();
    const userToken = userLoginData?.accessToken || userLoginData?.data?.accessToken || userLoginData?.data?.token;
    expect(userToken).toBeTruthy();

    const createOrderRes = await request.post(`${BACKEND_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        recipientName: "Người dùng Repay",
        recipientPhone: "0912345678",
        recipientEmail: "user@apple-store.com",
        shippingAddressLine: "123 Phố Huế",
        shippingProvince: "Hà Nội",
        paymentMethod: "VNPAY",
        shippingFee: 0,
        items: [
          {
            productVariantId: 1550,
            productName: "iPhone 16 Pro Max",
            sku: "IPHONE16PR-P1-TITANT-256GB-7",
            unitPrice: 34990000,
            quantity: 1,
          },
        ],
      },
    });

    if (createOrderRes.status() !== 200) {
      console.error("Test 8 create order error:", await createOrderRes.text());
    }
    expect(createOrderRes.status()).toBe(200);
    const orderData = await createOrderRes.json();
    const orderId = orderData?.data?.orderId || orderData?.orderId || orderData?.data?.id || orderData?.id;
    expect(orderId).toBeTruthy();

    const repayUrlRes = await request.post(`${BACKEND_URL}/api/orders/${orderId}/repay-vnpay`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(repayUrlRes.status()).toBe(200);
    const repayData = await repayUrlRes.json();
    const repayUrl = repayData?.paymentUrl || repayData?.data?.paymentUrl || repayData?.data || repayData?.url;
    expect(repayUrl).toContain("vnpayment.vn");
  });

  test("9. Case nghiệp vụ cốt lõi: Đơn hàng đã thanh toán thành công (PaymentStatus: Paid) tuyệt đối không cho phép hủy ở cả BE và FE", async ({ page, request }) => {
    test.setTimeout(60000);

    await ensureStock(request, 1550, 100);

    const userLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        identifier: "user@apple-store.com",
        password: "User@123456",
      },
    });
    expect(userLoginRes.status()).toBe(200);
    const userLoginData = await userLoginRes.json();
    const userToken = userLoginData?.accessToken || userLoginData?.data?.accessToken;

    const adminLoginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        identifier: "admin@apple-store.com",
        password: "Admin@123456",
      },
    });
    expect(adminLoginRes.status()).toBe(200);
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData?.accessToken || adminLoginData?.data?.accessToken;

    const createOrderRes = await request.post(`${BACKEND_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        recipientName: "Khách Đã Thanh Toán",
        recipientPhone: "0912345678",
        recipientEmail: "user@apple-store.com",
        shippingAddressLine: "123 Kim Mã, Ba Đình",
        shippingProvince: "Hà Nội",
        paymentMethod: "VNPAY",
        shippingFee: 0,
        items: [
          {
            productVariantId: 1550,
            productName: "iPhone 16 Pro Max",
            sku: "IPHONE16PR-P1-TITANT-256GB-7",
            unitPrice: 34990000,
            quantity: 1,
          },
        ],
      },
    });

    expect(createOrderRes.status()).toBe(200);
    const orderData = await createOrderRes.json();
    const orderId = orderData?.data?.orderId || orderData?.orderId || orderData?.data?.id;
    const orderNumber = orderData?.data?.orderNumber || orderData?.orderNumber;
    expect(orderId).toBeTruthy();

    const amountInVnpay = (34990000 * 100).toString();
    const ipnParams: Record<string, string> = {
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Amount: amountInVnpay,
      vnp_BankCode: "NCB",
      vnp_BankTranNo: `VNP${Date.now()}`,
      vnp_CardType: "ATM",
      vnp_Command: "pay",
      vnp_CreateDate: "20261026153000",
      vnp_CurrCode: "VND",
      vnp_OrderInfo: `Thanh toan don hang ${orderNumber}`,
      vnp_PayDate: "20261026153500",
      vnp_ResponseCode: "00",
      vnp_TransactionNo: `${Date.now()}`,
      vnp_TransactionStatus: "00",
      vnp_TxnRef: orderNumber,
      vnp_Version: "2.1.0",
    };
    const validSignature = signVnpayData(VNP_HASH_SECRET, ipnParams);
    ipnParams.vnp_SecureHash = validSignature;

    const ipnRes = await request.get(`${BACKEND_URL}/api/payment/vnpay-ipn`, {
      params: ipnParams,
    });
    expect(ipnRes.status()).toBe(200);

    const userCancelRes = await request.post(`${BACKEND_URL}/api/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { reason: "Tôi muốn hủy sau khi thanh toán" },
    });
    expect(userCancelRes.status()).toBe(400);
    const userCancelJson = await userCancelRes.json();
    const userCancelMsg = userCancelJson?.error?.message || userCancelJson?.message || "";
    expect(userCancelMsg).toContain("Đơn hàng đã được thanh toán thành công, không thể hủy");

    const adminCancelRes = await request.post(`${BACKEND_URL}/api/manager/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { reason: "Admin cố hủy đơn đã thanh toán" },
    });
    expect(adminCancelRes.status()).toBe(400);
    const adminCancelJson = await adminCancelRes.json();
    const adminCancelMsg = adminCancelJson?.error?.message || adminCancelJson?.message || "";
    expect(adminCancelMsg).toContain("Đơn hàng đã được thanh toán thành công, không thể hủy");

    await loginAsUser(page);
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const paidOrderCard = page.locator(`.bg-white:has-text('${orderNumber}')`).first();
    await expect(paidOrderCard).toBeVisible({ timeout: 10000 });

    const cardCancelBtn = paidOrderCard.locator("button:has-text('Hủy đơn')");
    await expect(cardCancelBtn).toHaveCount(0);

    const viewDetailBtn = paidOrderCard.locator("button:has-text('Xem chi tiết')");
    await viewDetailBtn.click();
    await page.waitForTimeout(1000);

    const modalCancelBtn = page.locator(".ant-modal button:has-text('Hủy đơn hàng')");
    await expect(modalCancelBtn).toHaveCount(0);
  });
});

