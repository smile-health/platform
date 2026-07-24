import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/auth-service/vitest.config.ts",
  "apps/core/vitest.config.ts",
  "apps/main/vitest.config.ts",
  "apps/openhim-mediators/rule-router/vitest.config.ts",
  "apps/platform/vitest.config.ts",
  "apps/warehouse-service/vitest.config.ts",
]);
