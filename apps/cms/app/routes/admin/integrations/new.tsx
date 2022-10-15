import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/server-runtime";
import { z } from "zod";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { FormInputField } from "~/libraries/ui/src/components/Forms";
import { createIntegration } from "~/models/integration.server";

const schema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(3).max(255),
  authorNotes: z.string(),
  description: z.string(),
  officialDocumentation: z.string().optional(),
  keywords: z.preprocess(
    (p) => (p as string).split(","),
    z.array(z.string().trim())
  ),
});

type FormErrors = {
  errors?: {
    name?: { _errors: string[] };
    slug?: { _errors: string[] };
    authorNotes?: { _errors: string[] };
    description?: { _errors: string[] };
    officialDocumentation?: { _errors: string[] };
    keywords?: { _errors: string[] };
    file?: { _errors: string[] };
  };
};

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 10_000_000,
  });

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const formPayload = Object.fromEntries(formData);
  const result = schema.safeParse(formPayload);

  if (!result.success) {
    return json(
      {
        errors: result.error.format(),
      },
      { status: 422 }
    );
  }

  const file = formData.get("file-upload");
  if (!(file instanceof File)) {
    return json(
      {
        errors: {
          file: {
            _errors: ["file is required"],
          },
        },
      },
      { status: 422 }
    );
  }

  const text = await file.text();
  if (text == null || text.length === 0) {
    return json(
      {
        errors: {
          file: {
            _errors: ["file text is required"],
          },
        },
      },
      { status: 422 }
    );
  }

  try {
    const specDocument = JSON.parse(text);

    const integration = await createIntegration(result.data, specDocument);

    return redirect(`/admin/integrations/${integration.slug}`);
  } catch (error) {
    throw error;
  }
};

export default function NewIntegrationRoute() {
  const actionData = useActionData<FormErrors>();
  const transition = useTransition();

  const isSubmitting =
    transition.state === "submitting" || transition.state === "loading";

  return (
    <Form
      method="post"
      encType="multipart/form-data"
      className="space-y-8 divide-y divide-gray-200"
    >
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Integration
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a new integration by giving it a unique name and an OpenAPI
              spec file
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <FormInputField
              label="Slug"
              id="slug"
              prefix="apihero.com/integrations/"
              errors={actionData?.errors?.slug?._errors}
            />
            <FormInputField
              label="Name"
              id="name"
              errors={actionData?.errors?.name?._errors}
            />
            <FormInputField
              label="Description"
              id="description"
              errors={actionData?.errors?.description?._errors}
            />
            <FormInputField
              label="Keywords"
              id="keywords"
              errors={actionData?.errors?.keywords?._errors}
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
                OpenAPI Spec File
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
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">JSON up to 10MB</p>
                </div>
              </div>
              <ErrorDisplay errors={actionData?.errors?.file?._errors} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Form>
  );
}
