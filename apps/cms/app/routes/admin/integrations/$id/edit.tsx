import { Form } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { unstable_parseMultipartFormData } from "@remix-run/server-runtime";
import { typedjson, useTypedActionData } from "remix-typedjson";
import { z } from "zod";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { FormInputField } from "~/libraries/ui/src/components/Forms";
import { typedRedirectWithSuccessMessage } from "~/models/message.server";
import { UpdateIntegration } from "~/services/integrations/update.server";
import { createUploadHandler } from "~/services/upload.server";
import { useIntegrationMatchData } from "../$id";

export async function action({ request, params }: ActionArgs) {
  const { id } = z.object({ id: z.string() }).parse(params);

  const formData = await unstable_parseMultipartFormData(
    request,
    createUploadHandler(`integrations/${id}`, "logoImage")
  );

  const payload = Object.fromEntries(formData);

  const service = new UpdateIntegration();

  const result = await service.call(id, payload);

  switch (result.status) {
    case "success":
      return typedRedirectWithSuccessMessage(
        `/admin/integrations/${id}`,
        request,
        "Succcessfully updated integration"
      );
    case "validationError":
      return typedjson({ errors: result.data }, { status: 422 });
  }
}

export default function EditIntegrationRoute() {
  const { integration } = useIntegrationMatchData();
  const actionData = useTypedActionData<typeof action>();

  if (!integration) {
    return null;
  }

  return (
    <Form
      method="post"
      className="space-y-8 divide-y divide-gray-200"
      encType="multipart/form-data"
    >
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <p className="mt-1 text-sm text-gray-500">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <FormInputField
              label="Name"
              id="name"
              errors={actionData?.errors?.name?._errors}
              defaultValue={integration.name}
            />

            <FormInputField
              label="Description"
              id="description"
              errors={actionData?.errors?.description?._errors}
              defaultValue={integration.description}
            />

            <FormInputField
              label="Official Documentation URL"
              id="officialDocumentation"
              errors={actionData?.errors?.officialDocumentation?._errors}
              defaultValue={integration.officialDocumentation}
            />

            <FormInputField
              label="Keywords"
              id="keywords"
              errors={actionData?.errors?.keywords?._errors}
              defaultValue={integration.keywords.join(", ")}
            />

            <div className="sm:col-span-6">
              <label
                htmlFor="authorNotes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="authorNotes"
                  name="authorNotes"
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={""}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Optional notes that may be used to describe the integration.
              </p>
              <ErrorDisplay errors={actionData?.errors?.authorNotes?._errors} />
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium text-gray-700"
              >
                Logo Image
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="logoImage"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a logo</span>
                      <input
                        id="logoImage"
                        name="logoImage"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG up to 1MB</p>
                </div>
              </div>
              <ErrorDisplay errors={actionData?.errors?.logoImage?._errors} />
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
