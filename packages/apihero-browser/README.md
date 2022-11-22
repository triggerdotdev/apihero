# @apihero/browser

## Installation

```bash
npm install @apihero/browser
```

## Usage

This library uses a Service Worker approach to capture and proxy API requests performed in the browser, so the setup is slightly different from Node.

You'll first need to add the Service Worker code to your public directly, using the `apihero-cli` cli:

```typescript
npm exec apihero-cli init public/ --save
```

Next, create a file to setup the worker, for example in `src/apihero.js`:

```javascript
// src/apihero.js
import { setupWorker } from "@apihero/browser";

export const worker = setupWorker({
  // You MUST supply the allow option for setupWorker, to ensure too many requests are not sent to the API Hero proxy
  allow: ["api.github.com", "api.twitter.com/users/*"],
  deny: ["myprivateapi.dev/*"],
  projectKey: "hero_123abc",
  url: "https://proxy.apihero.run",
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
