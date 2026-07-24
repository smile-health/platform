import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./test",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 10000,
  expect: { timeout: 3000 },
  reporter: [["line"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.WEB_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 5000,
    navigationTimeout: 8000,
    headless: true,
    launchOptions: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    },
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      timeout: 15000,
    },
    {
      name: "chromium-fast",
      testMatch: /.*ui.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "test/.auth/user.json",
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        bypassCSP: true,
      },
      dependencies: ["setup"],
    },
    /* ────── Warehouse API Tests ────── */
    {
      name: "warehouse-auth",
      testMatch: /auth\.setup\.ts/,
      testDir: "./test/api/warehouse",
    },
    {
      name: "warehouse-api",
      testDir: "./test/api/warehouse",
      testMatch: /.*\.test\.ts/,
      testIgnore: /auth\.setup\.ts/,
      use: {
        baseURL: process.env.WAREHOUSE_BASE_URL || "https://staging-api.smile-indonesia.id",
        extraHTTPHeaders: {
          "Device-Type": "web",
          "Content-Type": "application/json",
        },
      },
      dependencies: ["warehouse-auth"],
      fullyParallel: false,
    },
    /* ────── Main Service: Microplanning API Tests ────── */
    {
      name: "microplanning-auth",
      testMatch: /auth\.setup\.ts/,
      testDir: "./test/api/main/microplanning",
    },
    {
      name: "microplanning-api",
      testDir: "./test/api/main/microplanning",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /auth\.setup\.ts/,
      use: {
        baseURL: process.env.MAIN_BASE_URL || "https://staging-api.smile-indonesia.id",
        extraHTTPHeaders: {
          "Device-Type": "web",
          "Content-Type": "application/json",
        },
      },
      dependencies: ["microplanning-auth"],
      fullyParallel: false,
    },
  ],
});
