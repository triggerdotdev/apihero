import { Link } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { typedjson } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import { useTypedLoaderData } from "remix-typedjson/dist/remix";
import invariant from "tiny-invariant";
import { findReleasesBySchemaId } from "~/models/release.server";
import type { LoaderData as SchemaLoaderData } from "~/routes/admin/schemas/$id";
import { useApiSchemaMatchData } from "~/routes/admin/schemas/$id";

type LoaderData = UseDataFunctionReturn<typeof loader>;

export async function loader({ params }: LoaderArgs) {
  const { id } = params;

  invariant(id, "id is required");

  const releases = await findReleasesBySchemaId(id);

  return typedjson({ releases });
}

export default function ReleasesPage() {
  const { releases } = useTypedLoaderData<typeof loader>();
  const { schema } = useApiSchemaMatchData();

  return <ReleasesTable releases={releases} schema={schema} />;
}

function ReleasesTable({
  releases,
  schema,
}: {
  releases: LoaderData["releases"];
  schema: SchemaLoaderData["schema"];
}) {
  if (!schema) {
    return null;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Releases</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the releases in this Schema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="new">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Create new
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Version
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Message
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tag
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Commit
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Released
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {releases.map((release) => (
                    <tr key={release.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {release.releaseData ? (
                          <a
                            href={(release.releaseData as any).html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            {release.version}
                          </a>
                        ) : (
                          release.version
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {release.message}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {release.tagRef && (
                          <a
                            href={`https://github.com/apihero-run/${schema.integration.slug}/releases/tag/v${release.version}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            {(release.tagRef as any).ref}
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {release.commit && (
                          <a
                            href={(release.commit as any).html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            {truncate((release.commit as any).sha, 12)}
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(release.createdAt as unknown as string)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          className="text-indigo-600 hover:text-indigo-900"
                          to={release.id}
                        >
                          View more
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) : str;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}
