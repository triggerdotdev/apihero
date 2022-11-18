import { ClipboardIcon } from "@heroicons/react/24/outline";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import type { OpenAPIV3_1 } from "openapi-types";
import invariant from "tiny-invariant";
import { JSONEditor } from "~/libraries/common";
import { CodeEditor } from "~/libraries/common/src/components/editor/JavascriptEditor";
import {
  generateSpecFromSchemaScopedToOperation,
  getSchemaIdFromOperationId,
} from "~/models/apiSchema.server";
import { generateCodeForOperation } from "~/models/generator.server";

type LoaderData = {
  spec?: OpenAPIV3_1.Document;
  code?: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { operationId } = params;

  invariant(operationId, "operationId is required");

  const schemaId = await getSchemaIdFromOperationId(operationId);

  if (!schemaId) {
    return null;
  }

  const spec = await generateSpecFromSchemaScopedToOperation(
    schemaId,
    operationId
  );

  if (!spec) {
    return null;
  }

  const code = await generateCodeForOperation(operationId, spec);

  return { spec, code };
};

export default function SchemaOperationClientRoute() {
  const { spec, code } = useLoaderData<LoaderData>();

  return (
    <div className="mx-auto w-full sm:px-6 lg:px-8">
      <div className={`flex w-full justify-between transition`}>
        <div className="mr-1 h-fit rounded-sm bg-slate-200 px-2 py-0.5 text-slate-800 transition hover:cursor-pointer hover:bg-slate-300">
          <button
            type="button"
            className="flex items-center"
            onClick={() => {
              navigator.permissions
                .query({ name: "clipboard-write" as PermissionName })
                .then((result) => {
                  if (result.state === "granted") {
                    navigator.clipboard.writeText(
                      JSON.stringify(spec, null, 2)
                    );
                  }
                });
            }}
          >
            <ClipboardIcon className="mr-[2px] h-4 w-4" />
            <p className={`font-sans text-base`}>Copy Spec Doc</p>
          </button>
        </div>

        <div className="mr-1 h-fit rounded-sm bg-slate-200 px-2 py-0.5 text-slate-800 transition hover:cursor-pointer hover:bg-slate-300">
          <button
            type="button"
            className="flex items-center"
            onClick={() => {
              code &&
                navigator.permissions
                  .query({ name: "clipboard-write" as PermissionName })
                  .then((result) => {
                    if (result.state === "granted") {
                      navigator.clipboard.writeText(code);
                    }
                  });
            }}
          >
            <ClipboardIcon className="mr-[2px] h-4 w-4" />
            <p className={`font-sans text-base`}>Copy Code</p>
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <JSONEditor
          className="h-[calc(100vh-260px)] w-1/2 overflow-y-auto"
          content={JSON.stringify(spec, null, 2)}
          basicSetup={true}
        />
        <CodeEditor
          className="h-[calc(100vh-260px)] w-1/2"
          content={code ?? ""}
          basicSetup={true}
        />
      </div>
    </div>
  );
}
