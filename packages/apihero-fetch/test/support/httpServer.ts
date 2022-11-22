import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import express from "express";
import stream from "stream";
import cors from "cors";

export const httpsOptions: https.ServerOptions = {
  requestCert: false,
  rejectUnauthorized: false,
};

export interface ListenOptions {
  host: string;
}

export type HttpServerMiddleware = (app: express.Express) => void;

export interface HttpServerAddress {
  protocol: string;
  host: string;
  port: number;
  href: string;
}

export interface HttpServerApi {
  address: HttpServerAddress;
  url(path?: string): string;
}

export class HttpServer {
  private _http: http.Server | null;
  private _https: https.Server | null;
  private sockets: Set<stream.Duplex>;
  private app: express.Express;
  http: HttpServerApi;
  https: HttpServerApi;

  constructor(middleware?: HttpServerMiddleware) {
    this._http = null;
    this._https = null;
    this.sockets = new Set<stream.Duplex>();
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors());
    this.app.disable("x-powered-by");

    if (middleware) {
      middleware(this.app);
    }

    const allRoutes = this.app._router.stack
      .filter((entry) => entry.route)
      .map((entry) => entry.route.path);

    // Ensure that the root of the server is always responsive.
    if (!allRoutes.includes("/")) {
      this.app.get("/", (_, res) => {
        res.status(200).end();
      });
    }

    this._http = http.createServer(this.app);
    this._https = https.createServer(httpsOptions, this.app);
  }

  async listen(options?: ListenOptions): Promise<void> {
    if (this._http !== null) {
      const instance = await this.untilServerReady(this._http, options);

      this.http = this.buildHttpServerApi(instance);
    }

    if (this._https !== null) {
      const instance = await this.untilServerReady(this._https, options);

      this.https = this.buildHttpServerApi(instance);
    }
  }

  async close() {
    if (this._http !== null) {
      await this.closeServer(this._http);
    }

    if (this._https !== null) {
      await this.closeServer(this._https);
    }
  }

  buildHttpServerApi(server: http.Server | https.Server): HttpServerApi {
    const address = HttpServer.getServerAddress(server);
    return {
      address,
      url(path = "/") {
        return new URL(path, address.href).href;
      },
    };
  }
  untilServerReady(
    server: http.Server | https.Server,
    options = {
      host: "127.0.0.1",
    }
  ) {
    server.on("connection", (socket) => {
      this.sockets.add(socket);
      socket.on("close", () => {
        this.sockets.delete(socket);
      });
    });
    server.on("error", console.error);
    return new Promise<http.Server | https.Server>((resolve, reject) => {
      try {
        const listenOptions = {
          ...options,
          port: undefined,
        };
        const serverReference = server.listen(listenOptions, () => {
          resolve(serverReference);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  closeServer(server: http.Server | https.Server) {
    return new Promise<void>((resolve, reject) => {
      for (const socket of this.sockets) {
        socket.destroy();
      }
      if (!server.listening) {
        return resolve();
      }
      server.close((error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  static getServerAddress(
    server: http.Server | https.Server
  ): HttpServerAddress {
    // eslint-disable-next-line no-prototype-builtins
    const protocol = server.hasOwnProperty("key") ? "https:" : "http:";

    const serverAddress = server.address();

    if (typeof serverAddress === "string" || serverAddress === null) {
      throw new Error(`Unexpected server address type: ${serverAddress}`);
    }

    const { port, address: host } = serverAddress;

    const address = {
      protocol,
      host,
      port,
      href: null,
    };
    /**
     * Support "::1" as the hostname.
     * @see https://github.com/mswjs/interceptors/pull/283
     * @see https://github.com/mswjs/interceptors/commit/8de6a91568dcde044c15a9231285b38952e7ba5d
     */
    const resolvedHost =
      host.includes(":") && !host.startsWith("[") && !host.endsWith("]")
        ? `[${host}]`
        : host;
    Object.defineProperty(address, "href", {
      get() {
        return new URL(`${this.protocol}//${resolvedHost}:${this.port}`).href;
      },
      enumerable: true,
    });

    return address as unknown as HttpServerAddress;
  }
}
