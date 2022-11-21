import type { ProxyInstance } from "apihero-js/node";
import { setupProxy } from "apihero-js/node";
import { env } from "~/env.server";

let proxy: ProxyInstance;

declare global {
  var __ah_client__: ProxyInstance;
}

if (process.env.NODE_ENV === "production") {
  proxy = getProxy();
} else {
  if (!global.__ah_client__) {
    global.__ah_client__ = getProxy();
  }
  proxy = global.__ah_client__;
}

function getProxy() {
  const result = setupProxy({
    projectKey: env.APIHERO_PROJECT_KEY,
    env: process.env.NODE_ENV,
    allow: ["*api.mergent.co/*", "*api.mailgun.net/*"],
  });

  result.start();

  console.info("🔶 API Hero proxy running");

  process.once("SIGINT", () => result.stop());
  process.once("SIGTERM", () => result.stop());

  return result;
}

export default proxy;
