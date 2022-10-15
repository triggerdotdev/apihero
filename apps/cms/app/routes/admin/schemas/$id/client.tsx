import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { useState } from "react";
import clsx from "clsx";
import { JavascriptEditor } from "~/libraries/common/src/components/editor/JavascriptEditor";
import { generateFilesForSchema } from "~/models/generator.server";

type LoaderData = {
  spec?: Awaited<ReturnType<typeof generateFilesForSchema>>;
  files?: {
    [key: string]: string;
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  invariant(id, "id must be present");

  return generateFilesForSchema(id, "xxx");
};

export default function ModelRoute() {
  const { files } = useLoaderData<LoaderData>();

  if (!files) {
    return null;
  }

  return (
    <div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <Example files={files} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Example({ files }: { files: NonNullable<LoaderData["files"]> }) {
  const [currentFile, setCurrentFile] = useState(Object.keys(files)[0]);
  const currentFileContent = files[currentFile];

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Bottom section */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Main area */}
          <main className="min-w-0 flex-1 lg:flex">
            {/* Primary column */}
            <JavascriptEditor content={currentFileContent} basicSetup={true} />

            <aside className="order-first block flex-shrink-0">
              <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-gray-100">
                <nav className="space-y-1" aria-label="Sidebar">
                  {Object.keys(files).map((fileName) => (
                    <button
                      type="button"
                      onClick={() => setCurrentFile(fileName)}
                      key={fileName}
                      className={clsx(
                        fileName === currentFile
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium"
                      )}
                      aria-current={
                        fileName === currentFile ? "page" : undefined
                      }
                    >
                      <span className="truncate">{fileName}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </>
  );
}
