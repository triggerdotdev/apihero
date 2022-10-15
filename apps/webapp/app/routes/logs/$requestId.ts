import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { z } from "zod";
import { getRequestLogbyId } from "~/models/requestLog.server";
import { requireUserId } from "~/services/session.server";

export async function loader({ params, request }: LoaderArgs) {
  await requireUserId(request);

  const { requestId } = z.object({ requestId: z.string() }).parse(params);

  const requestLog = await getRequestLogbyId(requestId);

  if (!requestLog) {
    return redirect("/");
  }

  const path = `/workspaces/${requestLog.endpoint.client.project.workspace.slug}/projects/${requestLog.endpoint.client.project.slug}/${requestLog.endpoint.client.integration.slug}/${requestLog.endpoint.operation.method}/${requestLog.endpoint.operation.operationId}`;

  return redirect(path);
}
