import { setupWorker } from "@apihero/js";

const worker = setupWorker({
  projectKey: "hero_abc123",
  url: window.PROXY_URL,
});

worker.start();
