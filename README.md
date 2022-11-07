# API Hero (Developer Preview)

Make every API you use faster and more reliable with one line of code.

- Monitor every single API call your app makes
- Get alerts when issues arise and debug them easily
- Automatically cache responses using standard HTTP caching semantics
- Override HTTP caching semantics and cache more aggressively
- Get alerts BEFORE you hit rate limits
- Automatically obfuscate sensitive data
- All with just one line of code

## Installation

> We currently only support JavaScript & TypeScript, but more platforms are coming soon.

Install the latest `@apihero/js` package:

```bash
npm install @apihero/js@latest
```

If you only plan on using API Hero in development or testing environments, install into your `devDependencies`:

```bash
npm install @apihero/js@latest --save-dev
```

## Usage

To start intercepting API requests and proxying them through the API Hero service, you first will need a Project Key which you can receive by signing up to [apihero.run](http://apihero.run).

If you are running a Node.js app, include the following code somewhere that will be run at initialization:

```typescript
import { setupProxy } from "@apihero/js/node";

const proxy = setupProxy({ projectKey: "hero_123abc" });

// Start intercepting requests and sending them to proxy.apihero.run
proxy.start();
```

> setupProxy works by intercepting requests at the `node:http` and `node:https` level, and modifies the requests before they are sent to the API Hero proxy server. We take the same approach as [Mock Service Worker](https://mswjs.io/) (and we actually leverage their [low-level HTTP/HTTPS request interception library](https://github.com/mswjs/interceptors))

By default, this will proxy all requests, which may not be what you want (and could be a possible security issue). You can whitelist certain origins using the `allow` option:

```typescript
const proxy = setupProxy({
  projectKey: "hero_123abc",
  allow: ["api.github.com/*"],
});
```

You can also use a blocklist approach using the `deny` option:

```typescript
const proxy = setupProxy({
  projectKey: "hero_123abc",
  deny: ["internal.api.dev/*"],
});
```

If you don't want to intercept requests in production, you can do something like this:

```typescript
if (process.env.NODE_ENV !== "production") {
  const { setupProxy } = require("@apihero/js/node");
  const proxy = setupProxy({
    projectKey: "hero_123abc",
  });
  proxy.start();
}
```

You can also selectively stop intercepting/proxying requests using `proxy.stop()`;

## Coming soon

We plan on adding browser support very soon, as well as a custom `fetch` module that will allow you to use API Hero without stubbing the Node.js request modules.

## Plans

API Hero is still in early developer preview, and we plan on adding more features and platforms as quickly as we can. If you have any questions or feedback, please reach out to me personally: eric@apihero.run.
