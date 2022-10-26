/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import {
  BriefcaseIcon,
  CheckIcon,
  ChevronDownIcon,
  HashtagIcon,
  LinkIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import invariant from "tiny-invariant";
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { findSchemaById } from "~/models/apiSchema.server";
import { Link, NavLink, Outlet, useMatches } from "@remix-run/react";
import clsx from "clsx";
import { typedjson } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import { useTypedLoaderData } from "remix-typedjson/dist/remix";

export type LoaderData = UseDataFunctionReturn<typeof loader>;

export async function loader({ params }: LoaderArgs) {
  const { id } = params;

  invariant(id, "id is required");

  const schema = await findSchemaById(id);

  return typedjson({ schema });
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (data?.schema) {
    return {
      title: `API Hero - ${data.schema.title} (${data.schema.version})`,
      robots: "noindex,nofollow",
    };
  }

  return {};
};

export const useApiSchemaMatchData = () => {
  const matches = useMatches();

  const slugRoute = matches.find((match) => match.id.endsWith("/schemas/$id"));

  const { schema } = slugRoute?.data as LoaderData;

  return { schema };
};

export default function ApiSchemaIdRoute() {
  const { schema } = useTypedLoaderData<typeof loader>();

  if (!schema) {
    return null;
  }

  return (
    <div>
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            {schema.title}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <BriefcaseIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {schema.integration.slug}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <HashtagIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {schema.version}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <LinkIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {schema.servers.map((server) => server.url).join(", ")}
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
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

          <span className="sm:ml-3">
            <Link to="releases/new">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Publish
              </button>
            </Link>
          </span>

          {/* Dropdown */}
          <Menu as="div" className="relative ml-3 sm:hidden">
            <Menu.Button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              More
              <ChevronDownIcon
                className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 -mr-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/"
                      className={clsx(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      Edit
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/"
                      className={clsx(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      View
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      <Tabs schema={schema} />

      <div className="mt-5">
        <Outlet />
      </div>
    </div>
  );
}

export function Tabs({ schema }: Pick<LoaderData, "schema">) {
  const tabs = [
    { name: "Details", href: `/admin/schemas/${schema?.id}`, end: true },
    { name: "Operations", href: `operations` },
    { name: "Paths", href: "paths" },
    { name: "Models", href: "models" },
    { name: "Tags", href: "tags" },
    { name: "Security Schemes", href: "securitySchemes" },
    { name: "Document", href: "document" },
    { name: "Client", href: "client" },
    { name: "Releases", href: "releases" },
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
