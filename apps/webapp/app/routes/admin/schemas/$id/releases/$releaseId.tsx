import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { findReleaseById } from "~/models/release.server";
import { useApiSchemaMatchData } from "../../$id";

type LoaderData = {
  release: Awaited<ReturnType<typeof findReleaseById>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { releaseId } = params;

  invariant(releaseId, "releaseId is required");

  const release = await findReleaseById(releaseId);

  return { release };
};

export default function ReleaseRoute() {
  const { release } = useLoaderData<LoaderData>();
  const { schema } = useApiSchemaMatchData();

  if (!release || !schema) {
    return null;
  }

  return (
    <div>
      <div className="mt-5 border-gray-200">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Version</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {release.version}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Message</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {release.message}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Prerelease?</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {release.isPrerelease ? "Yes" : "No"}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {release.createdAt}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">NPM Package</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <a
                href={`https://www.npmjs.com/package/@apihero/${schema.integration.slug}/v/${release.version}`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                @apihero/{schema.integration.slug}/v/{release.version}
              </a>
            </dd>
          </div>

          {release.releaseData && (
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Release</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <a
                  href={(release.releaseData as any).html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  {(release.releaseData as any).name}
                </a>
              </dd>
            </div>
          )}

          {release.commit && (
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Commit</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <a
                  href={(release.commit as any).html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  {(release.commit as any).sha}
                </a>
              </dd>
            </div>
          )}

          {release.tagRef && (
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Tag</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <a
                  href={`https://github.com/apihero-run/${schema.integration.slug}/releases/tag/v${release.version}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  {(release.tagRef as any).ref}
                </a>
              </dd>
            </div>
          )}

          {release.gitRef && (
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Ref</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {(release.gitRef as any).ref}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
