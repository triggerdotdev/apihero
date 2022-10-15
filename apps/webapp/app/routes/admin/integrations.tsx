import { Link, Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { getAllIntegrations } from "~/models/integration.server";

export async function loader() {
  const integrations = await getAllIntegrations();

  return typedjson({ integrations });
}

export default function IntegrationsLayout() {
  const { integrations } = useTypedLoaderData<typeof loader>();

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Primary column */}
      <section
        aria-labelledby="primary-heading"
        className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last"
      >
        <div className="my-12 w-full px-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </section>

      {/* Secondary column (hidden on smaller screens) */}
      <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
        <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="flex flex-shrink-0 items-center px-4 py-2">
            <div className="w-full flex-shrink-0">
              <h1 className="mb-8 text-2xl font-medium text-gray-900">
                Integrations
              </h1>
              <ul className="-my-5 divide-y divide-gray-200">
                {integrations.map((integration) => (
                  <li key={integration.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {integration.name} ({integration.slug})
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {integration.description}
                        </p>
                      </div>
                      <div>
                        <Link
                          to={integration.id}
                          className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
