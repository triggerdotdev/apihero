import { LoaderArgs } from "@remix-run/server-runtime";
import { GetCachedResponseSchema } from "internal-logs";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { getProjectFromSlugs } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { projectSlug, workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");

  const project = await getProjectFromSlugs({
    workspaceSlug,
    slug: projectSlug,
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const logsOrigin = process.env.LOGS_ORIGIN;
  invariant(logsOrigin, "LOGS_ORIGIN env variables not defined");
  const authenticationToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
  invariant(
    authenticationToken,
    "LOGS_API_AUTHENTICATION_TOKEN env variables not defined"
  );

  const apiUrl = `${logsOrigin}/caching/${project.id}`;

  try {
    const cachedResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`,
      },
    });

    const json = await cachedResponse.json();
    const body = await GetCachedResponseSchema.parseAsync(json);

    return typedjson(body, { status: cachedResponse.status });
  } catch (error: any) {
    console.error(error);
    return typedjson({
      statusCode: 500,
      error: JSON.stringify(error),
      message: error.message as string,
    });
  }
};

export default function Caching() {
  const data = useTypedLoaderData<typeof loader>();
  return (
    <div>
      <div className="bg-slate-50 w-full flex items-center justify-center">
        Caching
      </div>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
}
