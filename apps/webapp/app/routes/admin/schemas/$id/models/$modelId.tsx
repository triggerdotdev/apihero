import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { JSONEditor } from "~/libraries/common";
import { findModelById } from "~/models/apiSchema.server";

type LoaderData = {
  model: Awaited<ReturnType<typeof findModelById>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { modelId } = params;

  invariant(modelId, "modelId must be present");

  const model = await findModelById(modelId);

  return { model };
};

export default function ModelRoute() {
  const { model } = useLoaderData<LoaderData>();

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">{model?.name}</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add model
          </button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <JSONEditor content={JSON.stringify(model?.contents, null, 2)} />
          </div>
        </div>
      </div>
    </div>
  );
}
