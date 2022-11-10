import { defineConfig } from "tsup";
import { workerScriptPlugin } from "./config/plugins/esbuild/workerScriptPlugin";

// Prevent from bundling the "@apihero/*" packages
// so that the users get the latest versions without
// having to bump them in "@apihero/js'."
const ecosystemDependencies = /^@apihero\/(.+)$/;

export default defineConfig([
  {
    name: "main",
    entry: ["./src/index.ts"],
    outDir: "./lib",
    format: ["cjs"],
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
  {
    name: "node",
    entry: ["./src/node/index.ts"],
    format: ["esm", "cjs"],
    outDir: "./lib/node",
    platform: "node",
    external: [
      "http",
      "https",
      "util",
      "events",
      "tty",
      "os",
      "timers",
      ecosystemDependencies,
    ],
    clean: true,
    sourcemap: true,
    dts: true,
    esbuildPlugins: [workerScriptPlugin()],
  },
]);
