import { defineConfig, devices } from "@playwright/test";

const isWorker = typeof process.env.TEST_WORKER_INDEX !== "undefined";
const isMainProcess = !isWorker;

if (isMainProcess) {
  const hasSpecificTarget = process.argv.some(
    (arg) => arg.includes(".spec.ts") || arg.includes("-g") || arg.includes("--grep")
  );

  if (!hasSpecificTarget) {
    throw new Error(
      "\n\n❌ [CHẶN KIỂM THỬ TOÀN BỘ HỆ THỐNG]\n" +
      "Quy chuẩn dự án ecommerce-apple-store CẤM TUYỆT ĐỐI việc chạy toàn bộ kịch bản test để tránh tốn quota/tài nguyên.\n" +
      "Chỉ được phép kiểm thử DUY NHẤT 1 file tính năng đang trực tiếp phát triển.\n" +
      "👉 Cú pháp đúng: npx playwright test e2e/<ten-file>.spec.ts --reporter=list\n\n"
    );
  }
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results.json" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    headless: true,
    trace: "off",
    screenshot: "off",
    video: "off",
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: "chromium-headless",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
