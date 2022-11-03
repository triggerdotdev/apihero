import { resolve, basename } from "path";

const SERVICE_WORKER_SOURCE_PATH = resolve(
  __dirname,
  "../",
  "src/proxyServiceWorker.js"
);

const SERVICE_WORKER_BUILD_PATH = resolve(
  __dirname,
  "../lib",
  basename(SERVICE_WORKER_SOURCE_PATH)
);

export { SERVICE_WORKER_SOURCE_PATH, SERVICE_WORKER_BUILD_PATH };
