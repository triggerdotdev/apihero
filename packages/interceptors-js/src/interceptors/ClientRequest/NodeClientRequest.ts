import type { Debugger } from "debug";
import type { OutgoingHttpHeaders, RequestOptions } from "http";
import {
  ClientRequest,
  IncomingMessage,
  globalAgent as httpGlobalAgent,
} from "http";
import { globalAgent as httpsGlobalAgent } from "https";
import { until } from "@open-draft/until";
import { Headers, objectToHeaders } from "headers-polyfill";
import type { ClientRequestEmitter } from ".";
import { bodyBufferToString } from "@mswjs/interceptors/lib/interceptors/ClientRequest/utils/bodyBufferToString";
import { getArrayBuffer } from "@mswjs/interceptors/lib/utils/bufferUtils";
import { concatChunkToBuffer } from "@mswjs/interceptors/lib/interceptors/ClientRequest/utils/concatChunkToBuffer";
import {
  ClientRequestWriteArgs,
  normalizeClientRequestWriteArgs,
} from "@mswjs/interceptors/lib/interceptors/ClientRequest/utils/normalizeClientRequestWriteArgs";
import { NormalizedClientRequestArgs } from "@mswjs/interceptors/lib/interceptors/ClientRequest/utils/normalizeClientRequestArgs";
import {
  ClientRequestEndChunk,
  normalizeClientRequestEndArgs,
} from "@mswjs/interceptors/lib/interceptors/ClientRequest/utils/normalizeClientRequestEndArgs";
import { getIncomingMessageBody } from "@mswjs/interceptors/lib/interceptors/ClientRequest/utils/getIncomingMessageBody";
import { cloneIncomingMessage } from "@mswjs/interceptors/lib/interceptors/ClientRequest/utils/cloneIncomingMessage";
import { IsomorphicRequest } from "@mswjs/interceptors";
import { InteractiveIsomorphicRequest } from "../../InteractiveIsomorphicRequest";
import { ModifiedRequest } from "../../types";

export type Protocol = "http" | "https";

export interface NodeClientOptions {
  emitter: ClientRequestEmitter;
  log: Debugger;
}

export class NodeClientRequest extends ClientRequest {
  /**
   * The list of internal Node.js errors to suppress while
   * using the "mock" response source.
   */
  static suppressErrorCodes = [
    "ENOTFOUND",
    "ECONNREFUSED",
    "ECONNRESET",
    "EAI_AGAIN",
  ];

  private url: URL;
  private options: RequestOptions;
  private emitter: ClientRequestEmitter;
  private log: Debugger;
  private chunks: Array<{
    chunk?: string | Buffer;
    encoding?: BufferEncoding;
  }> = [];
  private responseSource: "mock" | "bypass" = "mock";
  private capturedError?: NodeJS.ErrnoException;

  public requestBody: Buffer[] = [];

  constructor(
    [url, requestOptions, callback]: NormalizedClientRequestArgs,
    options: NodeClientOptions
  ) {
    let connectionUrl = url;

    const connectRequest = new InteractiveIsomorphicRequest(
      clientRequestArgsToIsomorphicRequest([url, requestOptions])
    );
    options.emitter.emit("connect", connectRequest);

    const modifiedRequestResponse = connectRequest.connectWith.invoked();
    const modifiedRequest = modifiedRequestResponse
      ? modifiedRequestResponse[0]
      : undefined;

    if (modifiedRequest && modifiedRequest.url) {
      if (
        modifiedRequest.url.protocol === "http:" &&
        url.protocol === "https:" &&
        !isLocalHost(modifiedRequest.url)
      ) {
        throw new Error(
          "Cannot use http protocol with https request, unless the host is localhost"
        );
      }

      options.log("connecting with a modified url:", modifiedRequest.url);

      requestOptions.host = modifiedRequest.url.host;
      requestOptions.hostname = modifiedRequest.url.hostname;
      requestOptions.port = modifiedRequest.url.port;
      requestOptions.path =
        modifiedRequest.url.pathname + modifiedRequest.url.search;
      requestOptions.protocol = modifiedRequest.url.protocol;

      if (requestOptions.protocol !== url.protocol) {
        options.log(
          "switching agents because we're now connecting on %s instead of %s",
          requestOptions.protocol,
          url.protocol
        );

        requestOptions._defaultAgent =
          requestOptions.protocol === "https:"
            ? httpsGlobalAgent
            : httpGlobalAgent;

        requestOptions.agent = requestOptions._defaultAgent;
      }

      connectionUrl = modifiedRequest.url;
    }

    if (modifiedRequest && modifiedRequest.headers) {
      options.log("connecting with modified headers:", modifiedRequest.headers);

      requestOptions.headers = modifiedRequest.headers;
    }

    super(requestOptions, callback);

    this.log = options.log.extend(
      `request ${requestOptions.method} ${connectionUrl.href}`
    );

    this.log("constructing ClientRequest using options:", {
      url: connectionUrl,
      requestOptions,
      callback,
    });

    this.url = connectionUrl;
    this.options = requestOptions;
    this.emitter = options.emitter;
  }

  write(...args: ClientRequestWriteArgs): boolean {
    const [chunk, encoding, callback] = normalizeClientRequestWriteArgs(args);
    this.log("write:", { chunk, encoding, callback });
    this.chunks.push({ chunk, encoding });
    this.requestBody = concatChunkToBuffer(chunk, this.requestBody);
    this.log("chunk successfully stored!", this.requestBody);

    /**
     * Prevent invoking the callback if the written chunk is empty.
     * @see https://nodejs.org/api/http.html#requestwritechunk-encoding-callback
     */
    if (!chunk || chunk.length === 0) {
      this.log("written chunk is empty, skipping callback...");
    } else {
      callback?.();
    }

    // Do not write the request body chunks to prevent
    // the Socket from sending data to a potentially existing
    // server when there is a mocked response defined.
    return true;
  }

  end(...args: any): this {
    this.log("end", args);
    const [chunk, encoding, callback] = normalizeClientRequestEndArgs(...args);

    const requestBody = this.getRequestBody(chunk);
    const isomorphicRequest = this.toIsomorphicRequest(requestBody);
    const interactiveIsomorphicRequest = new InteractiveIsomorphicRequest(
      isomorphicRequest
    );

    // Notify the interceptor about the request.
    // This will call any "request" listeners the users have.
    this.log(
      'emitting the "request" event for %d listener(s)...',
      this.emitter.listenerCount("request")
    );
    this.emitter.emit("request", interactiveIsomorphicRequest);

    // Execute the resolver Promise like a side-effect.
    // Node.js 16 forces "ClientRequest.end" to be synchronous and return "this".
    until(async () => {
      await this.emitter.untilIdle("request", ({ args: [request] }) => {
        /**
         * @note Await only those listeners that are relevant to this request.
         * This prevents extraneous parallel request from blocking the resolution
         * of another, unrelated request. For example, during response patching,
         * when request resolution is nested.
         */
        return request.id === interactiveIsomorphicRequest.id;
      });

      const [modifiedRequest] =
        await interactiveIsomorphicRequest.requestWith.invoked();
      this.log("event.requestWith called with:", modifiedRequest);

      return modifiedRequest;
    }).then(({ error: resolverException, data: modifiedRequest }) => {
      this.log("the listeners promise awaited!");

      // Halt the request whenever the resolver throws an exception.
      if (resolverException) {
        this.log(
          "encountered resolver exception, aborting request...",
          resolverException
        );
        this.emit("error", resolverException);
        this.terminate();

        return this;
      }

      if (modifiedRequest) {
        this.log("received modified request:", modifiedRequest);

        const endedRequest = this.requestWith(modifiedRequest);

        if (endedRequest) {
          this.log(
            "modified request has ended the origin request because it has a custom body",
            modifiedRequest
          );
          callback?.();
          return;
        }
      }

      // Set the response source to "bypass".
      // Any errors emitted past this point are not suppressed.
      this.responseSource = "bypass";

      // Propagate previously captured errors.
      // For example, a ECONNREFUSED error when connecting to a non-existing host.
      if (this.capturedError) {
        this.emit("error", this.capturedError);
        return this;
      }

      // Write the request body chunks in the order of ".write()" calls.
      // Note that no request body has been written prior to this point
      // in order to prevent the Socket to communicate with a potentially
      // existing server.
      this.log("writing request chunks...", this.chunks);

      for (const { chunk, encoding } of this.chunks) {
        if (encoding) {
          super.write(chunk, encoding);
        } else {
          super.write(chunk);
        }
      }

      this.once("error", (error) => {
        this.log("original request error:", error);
      });

      this.once("abort", () => {
        this.log("original request aborted!");
      });

      this.once("response-internal", async (response: IncomingMessage) => {
        const responseBody = await getIncomingMessageBody(response);
        this.log(response.statusCode, response.statusMessage, responseBody);
        this.log("original response headers:", response.headers);

        this.log('emitting the custom "response" event...');
        this.emitter.emit("response", isomorphicRequest, {
          status: response.statusCode || 200,
          statusText: response.statusMessage || "OK",
          headers: objectToHeaders(response.headers),
          body: responseBody,
        });
      });

      this.log("performing original request...");

      return super.end(
        ...[
          chunk,
          encoding as any,
          () => {
            this.log("original request end!");
            callback?.();
          },
        ].filter(Boolean)
      );
    });

    return this;
  }

  emit(event: string, ...data: any[]) {
    this.log("event:%s", event);

    if (event === "response") {
      this.log('found "response" event, cloning the response...');

      try {
        /**
         * Clone the response object when emitting the "response" event.
         * This prevents the response body stream from locking
         * and allows reading it twice:
         * 1. Internal "response" event from the observer.
         * 2. Any external response body listeners.
         * @see https://github.com/mswjs/interceptors/issues/161
         */
        const response = data[0] as IncomingMessage;
        const firstClone = cloneIncomingMessage(response);
        const secondClone = cloneIncomingMessage(response);

        this.emit("response-internal", secondClone);

        this.log('response successfully cloned, emitting "response" event...');
        return super.emit(event, firstClone, ...data.slice(1));
      } catch (error) {
        this.log("error when cloning response:", error);
        return super.emit(event, ...data);
      }
    }

    if (event === "error") {
      const error = data[0] as NodeJS.ErrnoException;
      const errorCode = error.code || "";

      this.log("error:\n", error);

      // Suppress certain errors while using the "mock" source.
      // For example, no need to destroy this request if it connects
      // to a non-existing hostname but has a mocked response.
      if (
        this.responseSource === "mock" &&
        NodeClientRequest.suppressErrorCodes.includes(errorCode)
      ) {
        // Capture the first emitted error in order to replay
        // it later if this request won't have any mocked response.
        if (!this.capturedError) {
          this.capturedError = error;
          this.log("captured the first error:", this.capturedError);
        }
        return false;
      }
    }

    return super.emit(event, ...data);
  }

  /**
   * Terminates a pending request.
   */
  private terminate(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.agent.destroy();
  }

  private getRequestBody(chunk: ClientRequestEndChunk | null): ArrayBuffer {
    const writtenRequestBody = bodyBufferToString(
      Buffer.concat(this.requestBody)
    );
    this.log("written request body:", writtenRequestBody);

    // Write the last request body chunk to the internal request body buffer.
    if (chunk) {
      this.requestBody = concatChunkToBuffer(chunk, this.requestBody);
    }

    const resolvedRequestBody = Buffer.concat(this.requestBody);
    this.log("resolved request body:", resolvedRequestBody);

    return getArrayBuffer(resolvedRequestBody);
  }

  private toIsomorphicRequest(body: ArrayBuffer): IsomorphicRequest {
    this.log("creating isomorphic request object...");

    const outgoingHeaders = this.getHeaders();
    this.log("request outgoing headers:", outgoingHeaders);

    const headers = normalizeOutgoingHeaders(outgoingHeaders);

    const isomorphicRequest = new IsomorphicRequest(this.url, {
      body,
      method: this.options.method || "GET",
      credentials: "same-origin",
      headers,
    });

    this.log("successfully created isomorphic request!", isomorphicRequest);
    return isomorphicRequest;
  }

  private requestWith(modifiedRequest: ModifiedRequest): boolean {
    this.log("requesting with a modified request", modifiedRequest);

    if (modifiedRequest.headers) {
      // Clear the existing headers
      this.getHeaderNames().forEach((headerName) => {
        this.removeHeader(headerName);
      });

      // use the modifiedRequest headers to set the request headers
      for (const [headerName, headerValue] of Object.entries(
        modifiedRequest.headers
      )) {
        this.setHeader(headerName, headerValue);
      }
    }

    if (modifiedRequest.method) {
      this.method = modifiedRequest.method;
    }

    if (modifiedRequest.url) {
      // Set the url
      this.host = modifiedRequest.url.host;
      this.path = modifiedRequest.url.pathname + modifiedRequest.url.search;
      this.protocol = modifiedRequest.url.protocol;

      this.setHeader("Host", modifiedRequest.url.host);
    }

    if (modifiedRequest.body) {
      this.end(Buffer.from(modifiedRequest.body));

      return true;
    }

    return false;
  }
}

function normalizeOutgoingHeaders(
  outgoingHeaders: OutgoingHttpHeaders | undefined
): Headers {
  if (!outgoingHeaders) {
    return new Headers();
  }

  const headers = new Headers();
  for (const [headerName, headerValue] of Object.entries(outgoingHeaders)) {
    if (!headerValue) {
      continue;
    }

    headers.set(headerName.toLowerCase(), headerValue.toString());
  }

  return headers;
}

function clientRequestArgsToIsomorphicRequest(
  args: NormalizedClientRequestArgs
): IsomorphicRequest {
  const [url, requestOptions] = args;

  return new IsomorphicRequest(url, {
    method: requestOptions.method || "GET",
    credentials: "same-origin",
    headers: normalizeOutgoingHeaders(requestOptions.headers),
  });
}

function isLocalHost(url: URL): boolean {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}
