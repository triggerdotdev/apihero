import { useMatches } from "@remix-run/react";
import type { User } from "~/models/user.server";

export function useUser(): User | undefined {
  const matches = useMatches();
  const user = matches.find((m) => m.id === "root")?.data.user;
  return user;
}
