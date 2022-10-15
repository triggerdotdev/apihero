import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { z } from "zod";
import { findSchemaById } from "~/models/apiSchema.server";
import { releaseSchema } from "~/models/release.server";

const FormSchema = z.object({
  version: z.string(),
  message: z.string(),
  isPrerelease: z.boolean(),
});

export const action: ActionFunction = async ({ params, request }) => {
  const { id } = params;

  invariant(id, "id is required");

  const formData = await request.formData();

  const version = formData.get("version");
  const message = formData.get("message");
  const isPrerelease = formData.get("isPrerelease");

  const data = FormSchema.parse({
    version,
    message,
    isPrerelease: isPrerelease === "on",
  });

  const release = await releaseSchema(id, data);

  return redirect(`/admin/schemas/${id}/releases/${release.id}`);
};

type LoaderData = {
  schema: Awaited<ReturnType<typeof findSchemaById>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  invariant(id, "id is required");

  const schema = await findSchemaById(id);

  return { schema };
};

export default function NewReleaseRoute() {
  const { schema } = useLoaderData<LoaderData>();
  const transition = useTransition();

  if (!schema) {
    return null;
  }

  return (
    <Form
      reloadDocument
      method="post"
      className="space-y-8 divide-y divide-gray-200"
    >
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Release {schema.integration.slug} {schema.version}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new release for {schema.title}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="version"
                className="block text-sm font-medium text-gray-700"
              >
                Version
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  apihero.run/integrations/{schema.integration.slug}/v
                </span>
                <input
                  type="text"
                  name="version"
                  id="version"
                  placeholder="1.0.0"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={2}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={""}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The commit and release message
              </p>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="isPrerelease"
                  name="isPrerelease"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="isPrerelease"
                  className="font-medium text-gray-700"
                >
                  Is Prerelease
                </label>
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
            disabled={transition.state !== "idle"}
          >
            {transition.state === "idle" ? "Save" : "Saving..."}
          </button>
        </div>
      </div>
    </Form>
  );
}
