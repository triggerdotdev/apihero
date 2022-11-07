# @apihero/js

## Installation

```bash
npm install @apihero/js
```

## Usage

### Node

Automatically proxy all 3rd-party requests through API Hero in Node.js

```typescript
import { setupProxy } from "@apihero/js/node";

const proxy = setupProxy({
  projectKey: "hero_123abc",
  server: "proxy.apihero.run",
});

// Start intercepting requests and sending them to proxy.apihero.run
proxy.start();

// You can always stop intercepting requests
proxy.stop();

// You can also pause during the execution of a callback
proxy.pause(async () => {
  await makeSomeSuperSecretCall();
});
```

You can also setup matchers for only capturing some traffic:

```typescript
import { setupProxy } from "@apihero/js/node";

const proxy = setupProxy({
  allow: [
    "https://api.github.com/*",
    "https://api.twitter.com/users/*",
    { url: "https://httpbin.org/*", method: "GET" },
  ],
  projectKey: "hero_123abc",
  server: "proxy.apihero.run",
});

// Start intercepting requests and sending them to proxy.apihero.run
proxy.start();
```

Capture all traffic except the matchers in the deny option:

```typescript
import { setupProxy } from "@apihero/js/node";

const proxy = setupProxy({
  deny: ["https://myprivateapi.dev/*"]
  projectKey: "hero_123abc",
  server: "proxy.apihero.run",
});

// Start intercepting requests and sending them to proxy.apihero.run
proxy.start();
```

### Browser (coming soon)

This library uses a Service Worker approach to capture and proxy API requests performed in the browser, so the setup is slightly different from Node.

You'll first need to add the Service Worker code to your public directly, using the `@apihero/js` cli:

```typescript
npx @apihero/js init public/ --save
```

Next, create a file to setup the worker, for example in `src/apihero.js`:

```javascript
// src/apihero.js
import { setupWorker } from "@apihero/js";

export const worker = setupWorker({
  include: ["api.github.com", "api.twitter.com/users/*"],
  exclude: ["myprivateapi.dev/*"],
  projectKey: "hero_123abc",
  server: "proxy.apihero.run",
});
```

Finally, will need to start the worker in your application code. For example, in a React app

```javascript
// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { worker } from "./apihero";

worker.start();

ReactDOM.render(<App />, document.getElementById("root"));
```

You could also restrict proxying to only local dev like so:

```javascript
// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

if (process.env.NODE_ENV === "development") {
  const { worker } = require("./apihero");
  worker.start();
}

ReactDOM.render(<App />, document.getElementById("root"));
```
