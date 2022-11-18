import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import * as Sentry from "@sentry/remix";
import { prisma } from "./db.server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // deepcode ignore Ssti: <This is recommended by Remix>
  const markup = renderToString(
    // deepcode ignore OR: <All good in the hood>
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html; charset=utf-8");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

Sentry.init({
  dsn: "https://a014169306c748b1adf61875c64b90de:a7fa7bfcc28d43e1bd293e121c677e4a@o4504169280569344.ingest.sentry.io/4504169281880064",
  tracesSampleRate: 1,
  integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});
