import { useMatches } from "@remix-run/react";

export function useCurrentWorkspaceSlug(): string | undefined {
  const matches = useMatches();
  const appRoute = matches.find((match) =>
    match.id.includes("/$workspaceSlug")
  );
  return appRoute?.params?.workspaceSlug;
}
