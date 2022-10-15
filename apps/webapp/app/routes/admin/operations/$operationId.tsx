import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { findOperationById } from "~/models/apiSchema.server";
import {
  ExternalLinkIcon,
  IdentificationIcon,
  LinkIcon,
  PencilIcon,
  TagIcon,
} from "@heroicons/react/solid";
import { ChevronRightIcon } from "@heroicons/react/solid";
import clsx from "clsx";

export type LoaderData = {
  operation: Awaited<ReturnType<typeof findOperationById>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { operationId } = params;

  invariant(operationId, "operationId is required");

  const operation = await findOperationById(operationId);

  return { operation };
};

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (data?.operation) {
    return {
      title: `API Hero - ${data.operation.summary}`,
      robots: "noindex,nofollow",
    };
  }

  return {};
};

export function useOperationData() {
  const matches = useMatches();

  const operationIdRoute = matches.find((match) =>
    match.id.endsWith("/operations/$operationId")
  );

  const { operation } = operationIdRoute?.data as LoaderData;

  return operation;
}

export default function SchemaOperationLayoutRoute() {
  const { operation } = useLoaderData<LoaderData>();

  if (!operation) {
    return null;
  }

  return <OperationLayout operation={operation} />;
}

function OperationLayout({
  operation,
}: {
  operation: NonNullable<LoaderData["operation"]>;
}) {
  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Primary column */}
      <section
        aria-labelledby="primary-heading"
        className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last"
      >
        <div className="w-full">
          <div className="bg-gray-50">
            {/* Page heading */}
            <header className="py-8">
              <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                      <li>
                        <div>
                          <Link
                            to="/admin/schemas"
                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            Schemas
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="flex items-center">
                          <ChevronRightIcon
                            className="h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                          />
                          <Link
                            to={`/admin/schemas/${operation.schemaId}`}
                            className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            {operation.schema.title}
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="flex items-center">
                          <ChevronRightIcon
                            className="h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                          />
                          <Link
                            to={`/admin/schemas/${operation.schemaId}/operations`}
                            className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            Operations
                          </Link>
                        </div>
                      </li>
                    </ol>
                  </nav>
                  <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                    {operation.summary}
                  </h1>
                  <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-8">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <TagIcon
                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      {operation.tags.map((tag) => (
                        <Link
                          key={tag.name}
                          to={`/admin/schemas/${operation.schemaId}/operations?search[tag][name]=${tag.name}`}
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <IdentificationIcon
                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      {operation.operationId}
                    </div>
                    {operation.externalDocsUrl && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <ExternalLinkIcon
                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        <a
                          href={operation.externalDocsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline hover:underline-offset-2"
                        >
                          External Docs
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 flex xl:mt-0 xl:ml-4">
                  <span className="hidden sm:block">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                    >
                      <PencilIcon
                        className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      Edit
                    </button>
                  </span>

                  <span className="ml-3 hidden sm:block">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                    >
                      <LinkIcon
                        className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      View
                    </button>
                  </span>
                </div>
              </div>
            </header>

            <Tabs operation={operation} />

            <main className="pb-16">
              <Outlet />
            </main>
          </div>
        </div>
      </section>
    </main>
  );
}

export function Tabs({
  operation,
}: {
  operation: NonNullable<LoaderData["operation"]>;
}) {
  const tabs = [
    { name: "Details", href: `/admin/operations/${operation.id}`, end: true },
    { name: "Parameters", href: `parameters` },
    { name: "Request", href: "request" },
    { name: "Response", href: "response" },
    { name: "Security Requirements", href: "security" },
    { name: "Client Code", href: "client" },
  ];

  return (
    <div className="pl-8">
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <NavLink
                to={tab.href}
                key={tab.name}
                end={tab.end}
                className={({ isActive }) =>
                  clsx(
                    isActive
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                  )
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
