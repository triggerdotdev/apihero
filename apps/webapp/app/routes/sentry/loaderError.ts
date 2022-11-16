import type { LoaderArgs } from "@remix-run/server-runtime";

export async function loader({ params }: LoaderArgs) {
  throw new Error("Sentry Error");
}
