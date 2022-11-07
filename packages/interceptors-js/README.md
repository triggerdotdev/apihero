## @apihero/interceptors-js

Low-level HTTP/HTTPS/fetch request interception library for Node.js and [Fetch platforms](https://fetch.spec.whatwg.org)

### Motivation

This library was inspired by [@mswjs/interceptors](https://github.com/mswjs/interceptors), but is not for mocking. Instead, this library allows requests to be intercepted and **altered** before they are sent, in a way that does not require an extra request fetching library.

### Usage

```bash
npm install @apihero/interceptors-js
```

### Fetch Intercepting

```typescript
import { FetchInterceptor } from "@apihero/interceptors-js/lib/interceptors/fetch";

const interceptor = new FetchInterceptor();
interceptor.apply();

interceptor.on("request", (request) => {
  console.log(`request ${request.method}: ${request.url.href}`);
});
```

#### Modifying requests

Use `request.requestWith()` to modify a request before it is executed.

```typescript
import { FetchInterceptor } from "@apihero/interceptors-js/lib/interceptors/fetch";

const interceptor = new FetchInterceptor();
interceptor.apply();

interceptor.on("request", (request) => {
  // Use a different url for the request, and override a header
  request.requestWith({
    url: new URL(request.url.pathname, "https://proxy.url"),
    headers: {
      "x-override": "this is a new header",
    },
  });
});
```

If you want to modify the host of a ClientRequest, make sure to also listen to the `connect` event and respond with the `request.connectWith` callback:

```typescript
import { ClientRequestInterceptor } from "@apihero/interceptors-js/lib/interceptors/ClientRequest";

const interceptor = new ClientRequestInterceptor();
interceptor.apply();

interceptor.on("connect", (request) => {
  // Connect to a different host
  request.connectWith({
    url: new URL(request.url.pathname, "https://proxy.url"),
  });
});

interceptor.on("request", (request) => {
  // Also override a header
  request.requestWith({
    headers: {
      "x-override": "this is a new header",
    },
  });
});
```
