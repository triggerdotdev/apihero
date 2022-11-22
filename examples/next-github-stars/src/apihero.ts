async function initProxy() {
  if (typeof window !== "undefined") {
    const { setupWorker } = await import("@apihero/browser");
    const worker = setupWorker({
      // You MUST supply the allow option for setupWorker, to ensure too many requests are not sent to the API Hero proxy
      allow: ["https://api.github.com/*"],
      projectKey: "hero_123abc",
      url: "http://localhost:8787",
      env: process.env.NODE_ENV,
    });
    await worker.start();
  } else {
    const { setupProxy } = await import("@apihero/node");
    const proxy = setupProxy({
      projectKey: "hero_123abc",
      url: "http://localhost:8787",
      env: process.env.NODE_ENV,
    });

    await proxy.start();
  }
}

initProxy();

export {};
