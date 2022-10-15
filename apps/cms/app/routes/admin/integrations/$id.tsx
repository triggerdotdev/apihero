/* This example requires Tailwind CSS v2.0+ */
import { BriefcaseIcon, HashtagIcon, PencilIcon } from "@heroicons/react/solid";
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { Link, NavLink, Outlet, useMatches } from "@remix-run/react";
import clsx from "clsx";
import { findIntegrationById } from "~/models/integration.server";
import { z } from "zod";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";

export type LoaderData = UseDataFunctionReturn<typeof loader>;

export async function loader({ params }: LoaderArgs) {
  const { id } = z.object({ id: z.string() }).parse(params);

  const integration = await findIntegrationById(id);

  return typedjson({ integration });
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (data?.integration) {
    return {
      title: `API Hero - ${data.integration.slug}`,
      robots: "noindex,nofollow",
    };
  }

  return {};
};

export const useIntegrationMatchData = () => {
  const matches = useMatches();

  const slugRoute = matches.find((match) =>
    match.id.endsWith("/integrations/$id")
  );

  const { integration } = slugRoute?.data as LoaderData;

  return { integration };
};

export default function ApiIntegrationIdRoute() {
  const { integration } = useTypedLoaderData<typeof loader>();

  if (!integration) {
    return null;
  }

  return (
    <div>
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            {integration.name}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <BriefcaseIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {integration.slug}
            </div>
            {integration.currentSchema && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <HashtagIcon
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                {integration.currentSchema.version}
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <Link to="edit">
            <span className="hidden sm:block">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <PencilIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Edit
              </button>
            </span>
          </Link>
        </div>
      </div>
      <Tabs integration={integration} />

      <div className="mt-5">
        <Outlet />
      </div>
    </div>
  );
}

export function Tabs({ integration }: Pick<LoaderData, "integration">) {
  const tabs = [
    {
      name: "Details",
      href: `/admin/integrations/${integration?.id}`,
      end: true,
    },
    { name: "Schemas", href: `schemas` },
  ];

  return (
    <div className="mt-12">
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
