import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import classNames from "classnames";
import clsx from "clsx";
import qs from "qs";
import invariant from "tiny-invariant";
import { classNamesForTagName } from "~/components/tags";
import type { OperationsParams } from "~/models/apiSchema.server";
import { bulkEditOperationAuthRequirement } from "~/models/apiSchema.server";
import {
  findOperationsBySchemaId,
  OperationsParamsSchema,
} from "~/models/apiSchema.server";
import {
  commitSession,
  getSession,
  setErrorMessage,
  setSuccessMessage,
} from "~/models/message.server";

type LoaderData = {
  operations: Awaited<ReturnType<typeof findOperationsBySchemaId>>;
  searchParams: OperationsParams;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const { id } = params;

  invariant(id, "id is required");

  return getOperationsForSchemaId(id, request.url);
};

export const action: ActionFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("cookie"));
  const { id } = params;

  invariant(id, "id is required");

  const { operations } = await getOperationsForSchemaId(id, request.url);

  const body = await request.formData();

  const operationIds = body.getAll("operationIds") as string[];

  try {
    await bulkEditOperationAuthRequirement(id, operations, operationIds);

    setSuccessMessage(session, "Saved operation auth settings");
  } catch (error) {
    setErrorMessage(
      session,
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  return json(
    {},
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

async function getOperationsForSchemaId(schemaId: string, urlString: string) {
  const url = new URL(urlString);

  const rawOperationParams = qs.parse(url.search, {
    ignoreQueryPrefix: true,
  });

  const operationParams = OperationsParamsSchema.parse(rawOperationParams);

  let operations = await findOperationsBySchemaId(schemaId, operationParams);

  if (url.searchParams.has("sortBy")) {
    if (url.searchParams.get("sortBy") === "tags") {
      operations = operations.sort((a, b) =>
        a.tags[0].name.localeCompare(b.tags[0].name)
      );
    }
  }

  if (url.searchParams.has("tag")) {
    operations = operations.filter((operation) =>
      operation.tags.some((tag) => tag.name === url.searchParams.get("tag"))
    );
  }

  return { operations, searchParams: operationParams };
}

export default function SchemaOperationsRoute() {
  const { operations, searchParams } = useLoaderData<LoaderData>();

  return <OperationList operations={operations} searchParams={searchParams} />;
}

function SearchDisplay({ search }: { search: OperationsParams["search"] }) {
  if (!search) {
    return null;
  }

  if (search.tag) {
    return <>Tag = {search.tag.name}</>;
  }

  return null;
}

function OperationList({ operations, searchParams }: LoaderData) {
  const location = useLocation();
  const transition = useTransition();

  return (
    <Form method="post" action={location.search}>
      <div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Operations</h1>
            <p className="mt-2 text-sm text-gray-700">
              {searchParams.search ? (
                <>
                  Found {operations.length} operations for{" "}
                  <span className="text-sm font-medium text-gray-900">
                    <SearchDisplay search={searchParams.search} />
                  </span>{" "}
                </>
              ) : (
                <>{operations.length} operations in this schema</>
              )}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="submit"
              className={clsx(
                "inline-flex items-center justify-center rounded-md border border-transparent  px-4 py-2 text-sm font-medium shadow-sm focus:outline-none sm:w-auto",
                transition.state === "idle"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500  focus:ring-offset-2"
                  : "bg-slate-400 text-white"
              )}
              disabled={transition.state !== "idle"}
            >
              {transition.state === "idle" ? "Update all" : "Updating..."}
            </button>
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
                        Info
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Summary
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Tags
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 font-normal sm:pr-6"
                      >
                        Auth Required
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {operations.map((operation) => (
                      <tr key={operation.id}>
                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <Link
                            to={`/admin/operations/${operation.id}`}
                            className=" hover:text-indigo-600"
                          >
                            <div className="flex items-center">
                              <div>
                                <div className="break-all text-sm font-medium text-gray-900">
                                  {operation.method} {operation.path.path}
                                </div>
                                <div className="break-all text-gray-500">
                                  {operation.operationId}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="break-word px-3 py-4 text-sm text-gray-500">
                          <div className="text-gray-900">
                            {operation.summary}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {operation.tags.map((tag) => (
                            <Link
                              key={tag.name}
                              to={`?search[tag][name]=${tag.name}`}
                            >
                              <span
                                className={classNames(
                                  "inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5",
                                  classNamesForTagName(tag.name)
                                )}
                              >
                                {tag.name}
                              </span>
                            </Link>
                          ))}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {operation.deprecated ? "Deprecated" : "Active"}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="mr-6">
                            <input
                              id={`operation-${operation.id}-required`}
                              name="operationIds"
                              defaultValue={operation.id}
                              type="checkbox"
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              defaultChecked={!operation.securityOptional}
                            />
                          </div>
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
    </Form>
  );
}
