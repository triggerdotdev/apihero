import {
  ChevronDownIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { AuthenticationBadges } from "~/libraries/common/src/components/AuthenticationBadges";
import { HTTPMethodLabel } from "~/libraries/common/src/components/HTTPMethod";
import { SecurityEditor } from "~/libraries/ui/src/components/client/AuthenticationEditor";
import { ExtraLargeTitle } from "~/libraries/ui/src/components/Primitives/ExtraLargeTitle";
import Resizable from "~/libraries/ui/src/components/Resizable";
import { syncIntegrationsSettingsWithGateway } from "~/models/gateway.server";
import { getHttpClientFromIntegrationSlug } from "~/models/httpClient.server";
import {
  deleteAuthentication,
  upsertBasicAuthentication,
  upsertBearerAuthentication,
} from "~/models/httpClientAuthentication.server";
import { requireUserId } from "~/services/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { projectSlug, workspaceSlug, integrationSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");
  invariant(integrationSlug, "integrationSlug not found");

  const client = await getHttpClientFromIntegrationSlug(
    workspaceSlug,
    projectSlug,
    integrationSlug
  );
  invariant(client, "client not found");
  invariant(client.integration.currentSchema, "currentSchema not found");

  //combine the schemes with the authentications
  const securitySchemes = client.integration.currentSchema.securitySchemes;
  const authentications = client.authentications;

  const schemesWithAuthentication = securitySchemes
    .filter((s) => s.isEnabled)
    .map((scheme) => {
      const authentication = authentications.find(
        (authentication) => authentication.securityScheme.id === scheme.id
      );
      if (authentication) {
        return { scheme, authentication };
      }
      return { scheme };
    });

  return typedjson({ client, securitySchemes: schemesWithAuthentication });
};

const BearerAuthSchema = z.object({
  httpFormat: z.literal("bearer"),
  token: z.string(),
  schemeId: z.string(),
});

const BasicAuthSchema = z.object({
  httpFormat: z.literal("basic"),
  username: z.string(),
  password: z.string(),
  schemeId: z.string(),
});

const AuthSchema = z.discriminatedUnion("httpFormat", [
  BearerAuthSchema,
  BasicAuthSchema,
]);

const ParamsSchema = z.object({
  workspaceSlug: z.string(),
  projectSlug: z.string(),
  integrationSlug: z.string(),
});

const DeleteSchema = z.object({
  schemeId: z.string(),
});

export async function action({ request, params }: ActionArgs) {
  const { projectSlug, workspaceSlug, integrationSlug } =
    ParamsSchema.parse(params);

  const client = await getHttpClientFromIntegrationSlug(
    workspaceSlug,
    projectSlug,
    integrationSlug
  );

  if (!client) {
    return new Response("Not found", { status: 404 });
  }

  const formPayload = Object.fromEntries(await request.formData());

  console.log(`request.method = ${request.method}`);

  if (request.method.toLowerCase() === "delete") {
    const { schemeId } = DeleteSchema.parse(formPayload);

    await deleteAuthentication(client.id, schemeId);

    await syncIntegrationsSettingsWithGateway({
      workspaceSlug,
      projectSlug,
      clientId: client.id,
    });

    return typedjson({ action: "delete", success: true });
  } else {
    const form = AuthSchema.parse(formPayload);

    switch (form.httpFormat) {
      case "basic": {
        const authentication = await upsertBasicAuthentication(
          client.id,
          form.schemeId,
          form
        );

        await syncIntegrationsSettingsWithGateway({
          workspaceSlug,
          projectSlug,
          clientId: client.id,
        });

        return typedjson({
          action: "save",
          success: true,
          authentication: authentication,
        });
      }
      case "bearer": {
        const authentication = await upsertBearerAuthentication(
          client.id,
          form.schemeId,
          form
        );

        await syncIntegrationsSettingsWithGateway({
          workspaceSlug,
          projectSlug,
          clientId: client.id,
        });

        return typedjson({
          action: "save",
          success: true,
          authentication: authentication,
        });
      }
    }
  }
}

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <>
      <main className="flex w-full flex-grow bg-slate-50">
        <article className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 overflow-y-auto p-6">
          <h3 className="text-2xl font-semibold capitalize text-slate-800">
            {data.client.integration.name} authentication
          </h3>

          {data.client.authentications.length === 0 ? (
            <div>No authentication set</div>
          ) : (
            <div>
              {data.client.authentications.length} authentication methods set
            </div>
          )}

          {data.securitySchemes.map((scheme) => (
            <SecurityEditor
              key={scheme.scheme.id}
              scheme={scheme.scheme}
              authentication={scheme.authentication}
            />
          ))}
        </article>
        <Resizable
          position="right"
          initialSize={450}
          minimumSize={300}
          maximumSize={700}
        >
          <div className="flex h-[calc(100vh-72px)] min-h-0 flex-1 flex-col overflow-y-auto bg-white">
            <div className="flex flex-col pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <ExtraLargeTitle className="text-slate-600">
                  Your endpoints
                </ExtraLargeTitle>
              </div>
              <div
                className="mt-3 mb-5 flex-1 space-y-1 px-4"
                aria-label="Sidebar"
              >
                <div className="mt-1 flex flex-col gap-2 space-y-1 px-2">
                  {data.client.endpoints.map(({ operation }) => (
                    <div key={operation.id}>
                      {operation.summary && (
                        <p className="font-base text-base text-slate-600">
                          {operation.summary}
                        </p>
                      )}
                      <h3 className="text-slate-600">
                        <HTTPMethodLabel
                          method={operation.method}
                          className="text-sm font-medium"
                        />
                        <span className="ml-2 font-medium">
                          {operation.path.path}
                        </span>
                      </h3>

                      <div className="mt-1 flex items-start gap-1">
                        {operation.securityOptional ? (
                          <p className="whitespace-nowrap py-1 text-xs text-slate-600">
                            Security optional:
                          </p>
                        ) : (
                          <div className="flex items-center gap-0.5">
                            <LockClosedIcon className="h-3 w-3 text-slate-600" />
                            <p className="whitespace-nowrap text-xs text-slate-600">
                              Security required:
                            </p>
                          </div>
                        )}
                        <AuthenticationBadges
                          securityRequirements={operation.securityRequirements}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center px-4">
              <ExtraLargeTitle className="text-slate-600">
                All endpoints
              </ExtraLargeTitle>
            </div>

            <div
              className="mt-5 mb-8 flex-1 space-y-1 px-4"
              aria-label="Sidebar"
            >
              {data.client.integration.currentSchema?.tags.map((tag) => (
                <TagGroup key={tag.id} tag={tag} />
              ))}
            </div>
          </div>
        </Resizable>
      </main>
    </>
  );
}

type Tag = {
  tag: NonNullable<
    UseDataFunctionReturn<
      typeof loader
    >["client"]["integration"]["currentSchema"]
  >["tags"][0];
};

function TagGroup({ tag }: Tag) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className="flex w-full text-sm text-slate-500 transition hover:text-slate-600"
        onClick={() => setIsOpen((s) => !s)}
      >
        {isOpen ? (
          <ChevronDownIcon className="mr-1 h-5 w-5" />
        ) : (
          <ChevronRightIcon className="mr-1 h-5 w-5" />
        )}
        <h2 className="grow text-left font-semibold uppercase tracking-wider">
          {tag.name}
        </h2>
        <span className="block text-slate-400">{tag._count.operations}</span>
      </button>
      {isOpen && (
        <div className="mt-1 flex flex-col gap-2 space-y-2 px-2 pl-6">
          {tag.operations.map((operation) => (
            <div key={operation.id}>
              {operation.summary && (
                <p className="text-base text-slate-600">{operation.summary}</p>
              )}
              <h3 className="font-medium text-slate-600">
                <HTTPMethodLabel
                  method={operation.method}
                  className="text-sm"
                />
                <span className="ml-2">{operation.path.path}</span>
              </h3>
              <div className="mt-1 flex items-center gap-1">
                {operation.securityOptional ? (
                  <p className="text-xs text-slate-600">Security optional:</p>
                ) : (
                  <div className="flex items-center gap-0.5">
                    <LockClosedIcon className="h-3 w-3 text-slate-600" />
                    <p className="text-xs text-slate-600">Security required:</p>
                  </div>
                )}
                <AuthenticationBadges
                  securityRequirements={operation.securityRequirements}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
