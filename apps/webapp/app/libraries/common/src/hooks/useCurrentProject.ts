import { useMatches } from "@remix-run/react";

export function useCurrentProjectSlug(): string | undefined {
  const matches = useMatches();
  const appRoute = matches.find((match) => match.id.endsWith("/$projectSlug"));
  return appRoute?.params?.projectSlug;
}
