import { setupWorker } from "@apihero/js";

const worker = setupWorker({
  projectKey: "hero_abc123",
  url: document.title,
  allow: ["http://httpbin.org/*"],
});

worker.start();
