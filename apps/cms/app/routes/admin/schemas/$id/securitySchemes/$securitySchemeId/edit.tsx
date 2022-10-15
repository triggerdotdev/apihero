import { Form } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { z } from "zod";
import {
  findSecuritySchemeById,
  updateSecuritySchemeById,
} from "~/models/apiSchema.server";
import { redirectWithSuccessMessage } from "~/models/message.server";

export async function loader({ params }: LoaderArgs) {
  const { securitySchemeId } = params;

  invariant(securitySchemeId, "securitySchemeId is required");

  const securityScheme = await findSecuritySchemeById(securitySchemeId);

  return typedjson({ securityScheme });
}

const FormSchema = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  isEnabled: z.string().optional(),
});

export async function action({ request, params }: LoaderArgs) {
  const { securitySchemeId, id } = params;

  invariant(securitySchemeId, "securitySchemeId is required");

  const formPayload = Object.fromEntries(await request.formData());

  const form = FormSchema.parse(formPayload);

  const securityScheme = await updateSecuritySchemeById(securitySchemeId, {
    title: form.title,
    description: form.description,
    summary: form.summary,
    isEnabled: form.isEnabled === "on",
  });

  return redirectWithSuccessMessage(
    `/admin/schemas/${id}/securitySchemes/${securityScheme.id}`,
    request,
    `Security scheme "${securityScheme.identifier}" updated`
  );
}

export default function EditSecuritySchemeRoute() {
  const { securityScheme } = useTypedLoaderData<typeof loader>();

  if (!securityScheme) {
    return <div>Security scheme not found</div>;
  }

  return (
    <Form method="post" className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit {securityScheme.identifier}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={securityScheme.title ?? ""}
                  placeholder="Personal Access Token"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Summary
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="summary"
                  id="summary"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={securityScheme.summary ?? ""}
                  placeholder="A personal access token for authentication"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={securityScheme.description ?? ""}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This will display when the developer is selecting an
                authentication method to use
              </p>
            </div>
            <div className="mt-4 space-y-4">
              <div className="relative flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="isEnabled"
                    name="isEnabled"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked={securityScheme.isEnabled}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="isEnabled"
                    className="font-medium text-gray-700"
                  >
                    Enabled?
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </Form>
  );
}
