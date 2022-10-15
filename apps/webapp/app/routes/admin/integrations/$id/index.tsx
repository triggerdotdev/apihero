import { useIntegrationMatchData } from "../$id";

export default function IntegrationDetailsRoute() {
  const { integration } = useIntegrationMatchData();

  if (!integration) {
    return null;
  }

  return (
    <div>
      <div className="mt-5 border-t border-gray-200">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {integration.description}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {integration.slug}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Keywords</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {integration.keywords.join(", ")}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Logo Image</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {integration.logoImage && (
                <img
                  src={`/logos/${integration.id}`}
                  alt="Logo"
                  className="max-h-12"
                />
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
