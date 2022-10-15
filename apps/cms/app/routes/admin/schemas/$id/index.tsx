import { CloudIcon } from "@heroicons/react/outline";
import { useApiSchemaMatchData } from "../$id";

export default function ApiSchemaDetailsRoute() {
  const { schema } = useApiSchemaMatchData();

  if (!schema) {
    return null;
  }

  return (
    <div>
      <div className="mt-5 border-t border-gray-200">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {schema.title}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Version</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {schema.version}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">
              OpenAPI Version
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {schema.openApiVersion}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {schema.description}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">License</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {schema.license}
            </dd>
          </div>
          {schema.externalDocsUrl && schema.externalDocsDescription && (
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">
                External Docs
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <a
                  href={schema.externalDocsUrl}
                  title={schema.externalDocsDescription}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-900 hover:text-slate-700 hover:underline hover:underline-offset-2"
                >
                  {schema.externalDocsDescription}
                </a>
              </dd>
            </div>
          )}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {schema.description}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Servers</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                {schema.servers.map((server) => (
                  <li
                    key={server.id}
                    className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                  >
                    <div className="flex w-0 flex-1 items-center">
                      <CloudIcon
                        className="h-5 w-5 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="ml-2 w-0 flex-1 truncate">
                        {server.url}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
