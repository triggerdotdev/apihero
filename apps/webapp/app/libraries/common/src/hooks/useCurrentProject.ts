import type { Project } from ".prisma/client";
import { useMatches } from "@remix-run/react";

export function useCurrentProjectSlug(): string | undefined {
  const matches = useMatches();
  const appRoute = matches.find((match) => match.id.endsWith("/$projectSlug"));
  return appRoute?.params?.projectSlug;
}

export function useCurrentProject(): Project | undefined {
  const matches = useMatches();
  const appRoute = matches.find((match) =>
    match.id.endsWith("/$projectSlug/home")
  );
  return appRoute?.data?.project;
}
