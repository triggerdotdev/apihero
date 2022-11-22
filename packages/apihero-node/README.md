# @apihero/node

## Installation

```bash
npm install @apihero/node
```

## Usage

Automatically proxy all 3rd-party requests through API Hero in Node.js

```typescript
import { setupProxy } from "@apihero/node";

const proxy = setupProxy({
  projectKey: "hero_123abc",
  url: "https://proxy.apihero.run",
});

// Start intercepting requests and sending them to https://proxy.apihero.run
proxy.start();

// You can always stop intercepting requests
proxy.stop();
```

You can also setup matchers for only capturing some traffic:

```typescript
import { setupProxy } from "@apihero/node";

const proxy = setupProxy({
  allow: [
    "https://api.github.com/*",
    "https://api.twitter.com/users/*",
    { url: "https://httpbin.org/*", method: "GET" },
  ],
  projectKey: "hero_123abc",
  url: "https://proxy.apihero.run",
});

// Start intercepting requests and sending them to https://proxy.apihero.run
proxy.start();
```

Capture all traffic except the matchers in the deny option:

```typescript
import { setupProxy } from "@apihero/node";

const proxy = setupProxy({
  deny: ["https://myprivateapi.dev/*"]
  projectKey: "hero_123abc",
  url: "https://proxy.apihero.run",
});

// Start intercepting requests and sending them to https://proxy.apihero.run
proxy.start();
```
