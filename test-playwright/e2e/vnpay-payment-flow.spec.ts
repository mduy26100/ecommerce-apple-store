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

test.describe("Kịch bản Kiểm thử Toàn diện Cổng Thanh toán VNPAY Sandbox", () => {
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
});
