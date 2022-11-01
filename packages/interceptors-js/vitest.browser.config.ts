/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    testTimeout: 1000000,
    environment: "happy-dom",
    setupFiles: ["./test/vitest.expect.ts", "./test/vitest.browser.setup.ts"],
    // setupFiles: ["./test/setup-test-env.ts"],
    include: [
      "./test/**/*.browser.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    watchExclude: [".*\\/node_modules\\/.*", ".*\\/build\\/.*"],
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      "**/*integration.test.ts",
    ],
  },
});
