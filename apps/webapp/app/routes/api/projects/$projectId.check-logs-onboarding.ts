import type { LoaderArgs } from "@remix-run/server-runtime";
import { z } from "zod";
import { searchLogsInProject } from "~/services/logs.server";
import { requireUserId } from "~/services/session.server";

export async function loader({ params, request }: LoaderArgs) {
  await requireUserId(request);

  const { projectId } = z.object({ projectId: z.string() }).parse(params);

  const logs = await searchLogsInProject(new URLSearchParams(), projectId);

  const hasLogs = typeof logs === "undefined" ? false : logs.logs.length > 0;

  return { hasLogs };
}
