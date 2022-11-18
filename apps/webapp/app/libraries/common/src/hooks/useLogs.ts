import { useMatches } from "@remix-run/react";
import type { GetLogsSuccessResponse } from "internal-logs";

export function useLogs(): GetLogsSuccessResponse | undefined {
  const matches = useMatches();
  const appRoute = matches.find((match) => match.id.endsWith("/home"));

  const appRouteData = appRoute?.data;

  if (!appRouteData) {
    throw new Error("Could not find app route data");
  }

  if (appRouteData.logs === undefined) {
    return undefined;
  }

  return appRouteData.logs as GetLogsSuccessResponse;
}
