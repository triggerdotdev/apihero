import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { allSchemas } from "~/models/apiSchema.server";

export const loader: LoaderFunction = async () => {
  const schemas = await allSchemas();

  return { schemas };
};

export default function SchemasLayout() {
  const { schemas } = useLoaderData<{
    schemas: Awaited<ReturnType<typeof allSchemas>>;
  }>();

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
          {/* Sidebar component */}
          <div className="flex flex-shrink-0 items-center px-4 py-2">
            <div className="w-full flex-shrink-0">
              <h1 className="mb-8 text-2xl font-medium text-gray-900">
                Schemas
              </h1>
              <ul className="-my-5 divide-y divide-gray-200">
                {schemas.map((schema) => (
                  <li key={schema.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {schema.title} ({schema.integration.slug})
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          v{schema.version}, OpenAPI v{schema.openApiVersion}
                        </p>
                      </div>
                      <div>
                        <Link
                          to={schema.id}
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
