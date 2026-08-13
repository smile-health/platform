import { defineConfig } from "vitest/config";
import path from "path";

// Applies to every <name>.service.test.ts across the whole app — encore.dev/api
// isn't loadable under plain vitest (only under `encore test`, which needs the
// Encore daemon), so every module's tests share this one alias instead of each
// inventing its own local stub/config.
export default defineConfig({
  test: {
    include: ["**/*.service.test.ts"],
    exclude: ["**/node_modules/**", "**/encore.gen/**"],
    // Forced sequential — `encore test` runs this against one shared
    // Encore-managed Postgres container + daemon; the default parallel
    // worker pool previously spiked memory enough to crash the machine.
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "encore.dev/api": path.resolve(__dirname, "shared/testing/encoreApiStub.ts"),
    },
  },
});
