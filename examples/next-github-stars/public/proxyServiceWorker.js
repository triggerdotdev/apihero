/* eslint-disable */
/* tslint:disable */

/**
 * Proxy Service Worker (1.0.0).
 * @see https://github.com/apihero-run/apihero
 * - Please do NOT modify this file.
 */

const INTEGRITY_CHECKSUM = "df39b13a982a31c85d206f1f9864184c";
const activeClientIds = new Set();

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", async function (event) {
  const clientId = event.source.id;

  if (!clientId || !self.clients) {
    return;
  }

  const client = await self.clients.get(clientId);

  if (!client) {
    return;
  }

  const allClients = await self.clients.matchAll({
    type: "window",
  });

  switch (event.data) {
    case "KEEPALIVE_REQUEST": {
      sendToClient(client, {
        type: "KEEPALIVE_RESPONSE",
      });
      break;
    }

    case "INTEGRITY_CHECK_REQUEST": {
      sendToClient(client, {
        type: "INTEGRITY_CHECK_RESPONSE",
        payload: INTEGRITY_CHECKSUM,
      });
      break;
    }

    case "PROXY_ACTIVATE": {
      activeClientIds.add(clientId);

      sendToClient(client, {
        type: "PROXYING_ENABLED",
        payload: true,
      });
      break;
    }

    case "PROXY_DEACTIVATE": {
      activeClientIds.delete(clientId);
      break;
    }

    case "CLIENT_CLOSED": {
      activeClientIds.delete(clientId);

      const remainingClients = allClients.filter((client) => {
        return client.id !== clientId;
      });

      // Unregister itself when there are no more clients
      if (remainingClients.length === 0) {
        self.registration.unregister();
      }

      break;
    }
  }
});

self.addEventListener("fetch", function (event) {
  const { request } = event;
  const accept = request.headers.get("accept") || "";

  // Bypass server-sent events.
  if (accept.includes("text/event-stream")) {
    return;
  }

  // Bypass navigation requests.
  if (request.mode === "navigate") {
    return;
  }

  // Opening the DevTools triggers the "only-if-cached" request
  // that cannot be handled by the worker. Bypass such requests.
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
    return;
  }

  // Bypass all requests when there are no active clients.
  // Prevents the self-unregistered worked from handling requests
  // after it's been deleted (still remains active until the next reload).
  if (activeClientIds.size === 0) {
    return;
  }

  // Generate unique request ID.
  const requestId = Math.random().toString(16).slice(2);

  event.respondWith(
    handleRequest(event, requestId).catch((error) => {
      // At this point, any exception indicates an issue with the original request/response.
      console.error(
        `\
[@apihero/js] Caught an exception from the "%s %s" request (%s). This is probably not a problem with @apihero/js. There is likely an additional logging output above.`,
        request.method,
        request.url,
        `${error.name}: ${error.message}`
      );
    })
  );
});

async function handleRequest(event, requestId) {
  const client = await resolveMainClient(event);

  try {
    const response = await getResponse(event, client, requestId);
    console.log(`[@apihero/js] handleRequest response`, response);
    return response;
  } catch (e) {
    console.error(`[@apihero/js] Error`, e);
    throw e;
  }
}

// Resolve the main client for the given event.
// Client that issues a request doesn't necessarily equal the client
// that registered the worker. It's with the latter the worker should
// communicate with during the response resolving phase.
async function resolveMainClient(event) {
  const client = await self.clients.get(event.clientId);

  if (client.frameType === "top-level") {
    return client;
  }

  const allClients = await self.clients.matchAll({
    type: "window",
  });

  return allClients
    .filter((client) => {
      // Get only those clients that are currently visible.
      return client.visibilityState === "visible";
    })
    .find((client) => {
      // Find the client ID that's recorded in the
      // set of clients that have registered the worker.
      return activeClientIds.has(client.id);
    });
}

async function getResponse(event, client, requestId) {
  const { request } = event;
  const clonedRequest = request.clone();

  function passthrough() {
    // Clone the request because it might've been already used
    // (i.e. its body has been read and sent to the client).
    const headers = Object.fromEntries(clonedRequest.headers.entries());

    // Remove APIHero-specific request headers so the bypassed requests
    // comply with the server's CORS preflight check.
    // Operate with the headers as an object because request "Headers"
    // are immutable.
    delete headers["x-ah-bypass"];

    console.log(
      `[@apihero/js] Bypassing the "%s %s" request.`,
      request.method,
      request.url
    );

    return fetch(clonedRequest, { headers });
  }

  // Bypass mocking when the client is not active.
  if (!client) {
    console.log(`[@apihero/js] No active client found.`);

    return passthrough();
  }

  // Bypass initial page load requests (i.e. static assets).
  // The absence of the immediate/parent client in the map of the active clients
  // means that MSW hasn't dispatched the "PROXY_ACTIVATE" event yet
  // and is not ready to handle requests.
  if (!activeClientIds.has(client.id)) {
    console.log(`[@apihero/js] The client "%s" is not active.`, client.id);

    return passthrough();
  }

  // Bypass requests with the explicit bypass header.
  // Such requests can be issued by "ctx.fetch()".
  if (request.headers.get("x-ah-bypass") === "true") {
    console.log(
      `[@apihero/js] Bypassing the "%s %s" request with the explicit bypass header.`,
      request.method,
      request.url
    );

    return passthrough();
  }

  // Skip the request if the the request is to the client itself
  console.log(
    `[@apihero/js] Requesting ${request.url}, client url is ${client.url}`
  );

  const clientUrl = new URL(client.url);
  const requestUrl = new URL(request.url);

  console.log(
    `[@apihero/js] Requesting ${requestUrl}, client url is ${clientUrl}`
  );

  if (clientUrl.origin === requestUrl.origin) {
    console.log(
      `[@apihero/js] Bypassing the "%s %s" request to the client origin.`,
      request.method,
      request.url
    );

    return passthrough();
  }

  console.log(`[@apihero/js] Sending REQUEST to the client ${requestId}`);

  // Notify the client that a request has been intercepted.
  const clientMessage = await sendToClient(client, {
    type: "REQUEST",
    payload: {
      id: requestId,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    },
  });

  switch (clientMessage.type) {
    case "PROXY_REQUEST": {
      return requestWith(clonedRequest, clientMessage.data);
    }

    case "PROXY_BYPASS": {
      return passthrough();
    }
  }

  return passthrough();
}

function sendToClient(client, message) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error);
      }

      resolve(event.data);
    };

    client.postMessage(message, [channel.port2]);
  });
}

async function requestWith(request, modifiedRequest) {
  const integratedRequest = await integrateModifiedRequest(
    request,
    modifiedRequest
  );

  console.log(
    `[@apihero/js] requestWith`,
    request,
    modifiedRequest,
    integratedRequest
  );

  const response = await fetch(integratedRequest);

  console.log(`[@apihero/js] response`, response);

  return response;
}

async function integrateModifiedRequest(request, modifiedRequest) {
  const method = modifiedRequest.method ?? request.method;
  const headers = integrateModifiedHeaders(
    request.headers,
    modifiedRequest.headers
  );

  const body = request.body !== null ? await request.text() : null;

  const newRequest = {
    method,
    headers,
    body,
    cache: request.cache,
    mode: request.mode,
    credentials: request.credentials,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    integrity: request.integrity,
    keepalive: request.keepalive,
    signal: request.signal,
    duplex: "half",
  };

  return new Request(modifiedRequest.url ?? request.url, newRequest);
}

function integrateModifiedHeaders(headers, modifiedHeaders) {
  if (!modifiedHeaders) {
    headers.add("x-ah-bypass", "true");
    return headers;
  }

  const normalizedHeaders = recordToHeaders(modifiedHeaders);

  const newHeaders = new Headers(headers);

  normalizedHeaders.forEach((value, name) => {
    newHeaders.set(name, value);
  });

  newHeaders.set("x-ah-bypass", "true");

  return newHeaders;
}

function recordToHeaders(recordHeaders) {
  const headers = new Headers();

  Object.entries(recordHeaders).forEach(([name, value]) => {
    headers.set(name, value);
  });

  return headers;
}
