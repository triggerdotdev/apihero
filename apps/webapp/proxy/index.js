const { setupProxy } = require("apihero-js/node");

const proxy = setupProxy({
  url: process.env.PROXY_URL,
  projectKey: process.env.APIHERO_KEY,
  allow: ["*api.mergent.co/v2/*", "*api.mailgun.net/*"],
});

proxy.start();

console.info("🔶 API Hero proxy running");

process.once("SIGINT", () => proxy.stop());
process.once("SIGTERM", () => proxy.stop());
