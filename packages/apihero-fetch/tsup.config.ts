import { defineConfig } from "tsup";

// Prevent from bundling the "@apihero/*" packages
// so that the users get the latest versions without
// having to bump them in "apihero-js'."
// const ecosystemDependencies = /^@apihero\/(.+)$/;

export default defineConfig([
  {
    name: "main",
    entry: ["./src/index.ts"],
    outDir: "./lib",
    platform: "neutral",
    format: ["cjs", "esm"],
    legacyOutput: true,
    sourcemap: true,
    clean: true,
    bundle: true,
    splitting: false,
    dts: true,
  },
]);
