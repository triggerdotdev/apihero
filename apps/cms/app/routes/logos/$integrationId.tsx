import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { z } from "zod";
import { findIntegrationById } from "~/models/integration.server";
import { getSignedGetUrl } from "~/services/upload.server";

export async function loader({ params }: LoaderArgs) {
  const { integrationId } = z
    .object({ integrationId: z.string() })
    .parse(params);

  const integration = await findIntegrationById(integrationId);

  if (!integration || !integration.logoImage) {
    return new Response("Not found", { status: 404 });
  }

  const signedUrl = await getSignedGetUrl(integration.logoImage);

  return redirect(signedUrl);
}
