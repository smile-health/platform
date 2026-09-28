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
    /* ────── SMILE Health (smile-health.badr.co.id, dev) — BA-339 ────── */
    {
      name: "smile-health-ui",
      testDir: "./test/ui-smile-health",
      testMatch: /\/auth\.spec\.ts$/,
      timeout: 25000,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.SMILE_HEALTH_BASE_URL || "https://smile-health.badr.co.id",
        viewport: { width: 1280, height: 720 },
        navigationTimeout: 15000,
      },
    },
    {
      name: "smile-health-setup",
      testDir: "./test/ui-smile-health",
      testMatch: /.*\.setup\.ts/,
      timeout: 50000,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.SMILE_HEALTH_BASE_URL || "https://smile-health.badr.co.id",
        navigationTimeout: 20000,
      },
    },
    {
      name: "smile-health-ui-authed",
      testDir: "./test/ui-smile-health",
      testMatch: /\/(authenticated|order-detail-bug|orders-stock-material|navigation)\.spec\.ts$/,
      timeout: 45000,
      expect: { timeout: 20000 },
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.SMILE_HEALTH_BASE_URL || "https://smile-health.badr.co.id",
        viewport: { width: 1280, height: 720 },
        actionTimeout: 15000,
        navigationTimeout: 20000,
        storageState: "test/ui-smile-health/.auth/qa-superadmin.json",
      },
      dependencies: ["smile-health-setup"],
    },
    {
      // Runs strictly after smile-health-ui-authed: logging out kills the
      // account's server-side session, which would break every other test
      // still relying on the same qa-superadmin.json storageState.
      name: "smile-health-logout",
      testDir: "./test/ui-smile-health",
      testMatch: /\/logout\.spec\.ts$/,
      timeout: 45000,
      expect: { timeout: 20000 },
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.SMILE_HEALTH_BASE_URL || "https://smile-health.badr.co.id",
        viewport: { width: 1280, height: 720 },
        actionTimeout: 15000,
        navigationTimeout: 20000,
        storageState: "test/ui-smile-health/.auth/qa-superadmin.json",
      },
      dependencies: ["smile-health-setup", "smile-health-ui-authed"],
    },
    {
      name: "smile-health-admin-gate",
      testDir: "./test/ui-smile-health",
      testMatch: /\/admin-gate\.spec\.ts$/,
      timeout: 45000,
      expect: { timeout: 20000 },
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.SMILE_HEALTH_BASE_URL || "https://smile-health.badr.co.id",
        viewport: { width: 1280, height: 720 },
        actionTimeout: 15000,
        navigationTimeout: 20000,
        storageState: "test/ui-smile-health/.auth/qa-manager.json",
      },
      dependencies: ["smile-health-setup"],
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
