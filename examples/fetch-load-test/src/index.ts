import { setupProxy } from "@apihero/js/node";
import fetch from "node-fetch";

export {};

export async function main() {
  const proxy = setupProxy({
    url: "http://localhost:8787",
    projectKey: "hero_123abc",
    env: "development",
  });

  proxy.start();

  const response = await fetch("https://httpbin.org/get", { agent: false });

  console.log(await response.json());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
