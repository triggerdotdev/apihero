import { useMatches } from "@remix-run/react";
import type { Log } from "internal-logs";

export function useLogs(): Log[] {
  const matches = useMatches();
  const appRoute = matches.find((match) => match.id.endsWith("/home"));

  const appRouteData = appRoute?.data;

  if (!appRouteData) {
    throw new Error("Could not find app route data");
  }

  return appRouteData.logs as Log[];
}
