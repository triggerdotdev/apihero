import { defineConfig } from "tsup";
import { workerScriptPlugin } from "./config/plugins/esbuild/workerScriptPlugin";

export default defineConfig([
  {
    name: "main",
    entry: ["./src/index.ts"],
    outDir: "./lib",
    format: ["esm", "cjs"],
    legacyOutput: true,
    sourcemap: true,
    clean: true,
    bundle: true,
    splitting: false,
    dts: true,
    esbuildPlugins: [workerScriptPlugin()],
  },
  {
    name: "iife",
    entry: ["./src/index.ts"],
    outDir: "./lib",
    legacyOutput: true,
    format: ["iife"],
    platform: "browser",
    globalName: "ApiHero",
    bundle: true,
    sourcemap: true,
    splitting: false,
    dts: true,
    esbuildPlugins: [workerScriptPlugin()],
  },
]);
