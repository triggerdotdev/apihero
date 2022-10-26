import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import clsx from "clsx";
import { useState } from "react";
import invariant from "tiny-invariant";
import { JSONEditor } from "~/libraries/common";
import { generateSpecFromSchema } from "~/models/apiSchema.server";
import { useApiSchemaMatchData } from "../$id";

type LoaderData = {
  openApiSchema: any;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  invariant(id, "id is required");

  const openApiSchema = await generateSpecFromSchema(id);

  return { openApiSchema };
};

export default function SchemaDocumentRoute() {
  const { schema } = useApiSchemaMatchData();
  const { openApiSchema } = useLoaderData<LoaderData>();

  if (!schema) {
    return null;
  }

  return (
    <div>
      <Tabs
        originalSchema={schema.rawData}
        openApiSchema={openApiSchema}
        schemaId={schema.id}
      />
    </div>
  );
}

const tabs = [{ name: "Original" }, { name: "Generated" }];

function Tabs({
  originalSchema,
  openApiSchema,
  schemaId,
}: {
  originalSchema: any;
  openApiSchema: any;
  schemaId: string;
}) {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab, tabIndex) => (
            <button
              key={tab.name}
              onClick={() => setCurrentTab(tabIndex)}
              className={clsx(
                tabIndex === currentTab
                  ? "bg-gray-100 text-gray-700"
                  : "text-gray-500 hover:text-gray-700",
                "rounded-md px-3 py-2 text-sm font-medium"
              )}
              aria-current={tabIndex === currentTab ? "page" : undefined}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      {currentTab === 0 && (
        <div className="mt-2">
          <div className={`flex w-full justify-end transition`}>
            <div className="mr-1 h-fit rounded-sm bg-slate-200 px-2 py-0.5 text-slate-800 transition hover:cursor-pointer hover:bg-slate-300">
              <a
                href={`/admin/schemas/${schemaId}/downloadOriginal`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center"
              >
                <ArrowDownTrayIcon className="mr-[2px] h-4 w-4" />
                <p className={`font-sans text-base`}>Download</p>
              </a>
            </div>
          </div>

          <JSONEditor
            content={JSON.stringify(originalSchema, null, 2)}
            readOnly={true}
            basicSetup={true}
          />
        </div>
      )}
      {currentTab === 1 && (
        <div className="mt-2">
          <div className={`flex w-full justify-end transition`}>
            <div className="mr-1 h-fit rounded-sm bg-slate-200 px-2 py-0.5 text-slate-800 transition hover:cursor-pointer hover:bg-slate-300">
              <a
                href={`/admin/schemas/${schemaId}/download`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center"
              >
                <ArrowDownTrayIcon className="mr-[2px] h-4 w-4" />
                <p className={`font-sans text-base`}>Download</p>
              </a>
            </div>
          </div>

          <JSONEditor
            content={JSON.stringify(openApiSchema, null, 2)}
            readOnly={true}
            basicSetup={true}
          />
        </div>
      )}
    </div>
  );
}
