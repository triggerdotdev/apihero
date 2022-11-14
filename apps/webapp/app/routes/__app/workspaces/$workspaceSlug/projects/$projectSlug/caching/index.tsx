import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
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
      {"records" in data && (
        <table className="w-full divide-y divide-slate-300">
          <thead className="sticky top-0 bg-white outline outline-2 outline-slate-200">
            <tr>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-semibold text-slate-900"
              >
                API
              </th>
              <th
                scope="col"
                className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
              >
                Hit rate
              </th>
              <th
                scope="col"
                className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
              >
                Hits <span className="font-normal">(p50)</span>
              </th>
              <th
                scope="col"
                className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
              >
                Misses <span className="font-normal">(p50)</span>
              </th>
              <th
                scope="col"
                className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
              >
                Speed boost
              </th>
              <th
                scope="col"
                className="py-3 pl-4 pr-3 text-right text-xs font-semibold leading-tight text-slate-900 sm:pl-6"
              ></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.records.length > 0 ? (
              data.records.map((record) => {
                return (
                  <tr
                    key={record.baseUrl}
                    className="w-full px-4 py-2 text-left bg-white hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                      {record.api}
                    </td>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                      {(record.hitRate * 100).toFixed(1)}%
                    </td>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                      {record.hitCount} ({record.hitP50Time.toFixed(0)}ms)
                    </td>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                      {record.missCount} ({record.missP50Time.toFixed(0)}ms)
                    </td>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                      {(record.missP50Time / record.hitP50Time).toFixed(1)}x
                    </td>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                      Cached from headers
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-6 text-sm text-center">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center justify-center p-3 gap-1 bg-yellow-200 border border-yellow-400 rounded-md text-yellow-700">
                      <ExclamationTriangleIcon className="w-4 h-4 " />
                      <span className="text-gray">
                        No API logs found in your current date range
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
