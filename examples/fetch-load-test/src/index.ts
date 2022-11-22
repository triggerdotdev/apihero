import { setupProxy } from "@apihero/node";
import fetch, { Request, type Response } from "node-fetch";
import { parseArgs } from "node:util";

class HttpBin {
  constructor(public url: string, private readonly verbose: boolean) {}

  async doGet() {
    const req = new Request(`${this.url}/get`);
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async doPost(body: any) {
    const req = new Request(`${this.url}/post`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async doPut(body: any) {
    const req = new Request(`${this.url}/put`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async doDelete() {
    const req = new Request(`${this.url}/delete`, {
      method: "DELETE",
    });
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async do400(method: string, body?: string) {
    const req = new Request(`${this.url}/status/400`, {
      method,
      body,
    });

    const res = await fetch(req);

    this.logResponse(res, req);
  }

  async do401(method: string, body?: string) {
    const req = new Request(`${this.url}/status/401`, {
      method,
      body,
    });

    const res = await fetch(req);

    this.logResponse(res, req);
  }

  async do403(method: string, body?: string) {
    const req = new Request(`${this.url}/status/403`, {
      method,
      body,
    });

    const res = await fetch(req);

    this.logResponse(res, req);
  }

  async do404(method: string, body?: string) {
    const req = new Request(`${this.url}/status/404`, {
      method,
      body,
    });

    const res = await fetch(req);

    this.logResponse(res, req);
  }

  async do500(method: string, body?: string) {
    const req = new Request(`${this.url}/status/500`, {
      method,
      body,
    });

    const res = await fetch(req);

    this.logResponse(res, req);
  }

  async doBearerAuth(token: string) {
    const req = new Request(`${this.url}/bearer`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async doCachedGet(numberOfSeconds: number) {
    const req = new Request(`${this.url}/cache/${numberOfSeconds}`);
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async doBrotli() {
    const req = new Request(`${this.url}/brotli`);
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async doHTML() {
    const req = new Request(`${this.url}/html`);
    const res = await fetch(req);

    this.logResponse(res, req);
    return res.text();
  }

  async doXML() {
    const req = new Request(`${this.url}/xml`);
    const res = await fetch(req);

    this.logResponse(res, req);
    return res.text();
  }

  async doDelay(seconds: number) {
    const req = new Request(`${this.url}/delay/${seconds}`);
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  async doStreamJSON(numberOfResponses: number) {
    const req = new Request(`${this.url}/stream/${numberOfResponses}`);
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.text();
  }

  async doGetImage(type: string) {
    const req = new Request(`${this.url}/image`, {
      headers: {
        Accept: `image/${type}`,
      },
    });
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.buffer();
  }

  async doRedirect(numberOfRedirects: number) {
    const req = new Request(`${this.url}/redirect/${numberOfRedirects}`);
    const res = await fetch(req);

    this.logResponse(res, req);

    return res.json();
  }

  private logResponse(res: Response, req: Request) {
    if (this.verbose) {
      console.log(`${res.status} ${req.method} ${req.url}`);
    }
  }
}

export async function main() {
  const { values: options } = parseArgs({
    options: {
      verbose: {
        type: "boolean",
        short: "v",
      },
      iterations: {
        type: "string",
        short: "n",
      },
      key: {
        type: "string",
        short: "p",
      },
      env: {
        type: "string",
        short: "e",
      },
      url: {
        type: "string",
        short: "u",
      },
      ["bin-url"]: {
        type: "string",
        short: "b",
      },
    },
    args: process.argv.slice(2),
  });

  const defaultOptions = {
    verbose: false,
    iterations: 5,
    env: "development",
    url: "https://proxy.apihero.run",
    ["bin-url"]: "https://httpbin.org",
  };

  const opts = {
    ...defaultOptions,
    ...options,
  };

  if (!opts.key) {
    throw new Error("Missing key");
  }

  if (typeof opts.url !== "string") {
    throw new Error("Missing url");
  }

  const binUrl = opts["bin-url"]!;

  const httpBin = new HttpBin(binUrl, opts.verbose!);

  const proxy = setupProxy({
    projectKey: opts.key,
    env: opts.env,
    url: opts.url,
  });

  if (opts.verbose) {
    console.log(`Proxying requests from ${opts["bin-url"]} to ${opts.url}`);
  }

  proxy.start();

  const iterations = Number(opts.iterations);

  if (opts.verbose) {
    console.log(`Running ${iterations} iterations of fetch`);
  }

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const json = await httpBin.doGet();

    await httpBin.doPost(json);
    await httpBin.doPut(json);
    await httpBin.doDelete();
    await httpBin.do400("POST", JSON.stringify({ invalid: "json" }));
    await httpBin.do401("GET");
    await httpBin.do401("POST");
    await httpBin.do403("PUT", JSON.stringify({ foo: "bar" }));
    await httpBin.do404("DELETE");
    await httpBin.do500("GET");
    await httpBin.doBearerAuth("foo123");
    await httpBin.doCachedGet(60);
    await httpBin.doCachedGet(60);
    // await httpBin.doBrotli();
    await httpBin.doHTML();
    await httpBin.doXML();
    await httpBin.doDelay(0.25);
    await httpBin.doStreamJSON(5);
    await httpBin.doGetImage("png");
    await httpBin.doGetImage("jpeg");
    await httpBin.doRedirect(5);
  }

  const end = performance.now();

  const duration = end - start;

  console.log(
    `Took ${duration}ms to run ${iterations} iterations (${
      duration / iterations
    }ms per iteration)`
  );

  if (opts.verbose) {
    console.log(`Stopping proxy`);
  }

  proxy.stop();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
