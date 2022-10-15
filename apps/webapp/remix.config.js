/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*"],
  devServerPort: 8002,
  serverDependenciesToBundle: [
    "@apihero/internal-nobuild",
    "@apihero/database",
    "@apihero/business",
    "@apihero/ui",
    "pretty-bytes",
    "marked",
    "@cfworker/json-schema",
  ],
  watchPaths: async () => {
    return [
      "../../packages/ui/src/**/*",
      "../../packages/business/src/**/*",
      "../../packages/database/src/**/*",
      "../../packages/internal-nobuild/src/**/*",
    ];
  },
};
