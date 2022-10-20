import { marked } from "marked";
import { CodeIcon } from "@heroicons/react/solid";
import type { ApiSchemaParameter } from ".prisma/client";
import { CheckCircleIcon } from "@heroicons/react/outline";
import { JSONEditor } from "~/libraries/common";
import { useOperationData } from "../$operationId";

export default function OperationIndexRoute() {
  const operation = useOperationData();

  if (!operation) {
    return null;
  }

  return <OperationPage operation={operation} />;
}

function OperationPage({
  operation,
}: {
  operation: NonNullable<ReturnType<typeof useOperationData>>;
}) {
  return (
    <div className="mx-auto w-full sm:px-6 lg:px-8">
      <div className="mb-6 mt-4 text-xl font-medium">
        {operation.method} {operation.path.path}
      </div>
      {operation.description && (
        <div
          className="prose prose-slate px-4 sm:px-0"
          dangerouslySetInnerHTML={{
            __html: marked(operation.description),
          }}
        >
          {}
        </div>
      )}

      {operation.extensions && (
        <div className="mt-8">
          <h2 className="text-xl font-medium">Extensions</h2>
          <JSONEditor
            content={JSON.stringify(operation.extensions, null, 2)}
            readOnly={true}
            basicSetup={false}
          />
        </div>
      )}

      {operation.parameters.filter((param) => param.location === "PATH")
        .length > 0 && (
        <div className="mt-8 mb-8">
          <ParameterTable
            title="Path Parameters"
            parameters={operation.parameters.filter(
              (param) => param.location === "PATH"
            )}
          />
        </div>
      )}

      {operation.parameters.filter((param) => param.location === "QUERY")
        .length > 0 && (
        <div className="mt-8 mb-8">
          <ParameterTable
            title="Query Parameters"
            parameters={operation.parameters.filter(
              (param) => param.location === "QUERY"
            )}
          />
        </div>
      )}

      {operation.parameters.filter((param) => param.location === "HEADER")
        .length > 0 && (
        <div className="mt-8 mb-8">
          <ParameterTable
            title="Header Parameters"
            parameters={operation.parameters.filter(
              (param) => param.location === "HEADER"
            )}
          />
        </div>
      )}

      {operation.parameters.filter((param) => param.location === "COOKIE")
        .length > 0 && (
        <div className="mt-8 mb-8">
          <ParameterTable
            title="Cookie Parameters"
            parameters={operation.parameters.filter(
              (param) => param.location === "COOKIE"
            )}
          />
        </div>
      )}

      {operation.responseBodies.map((responseBody) => (
        <div
          key={responseBody.id}
          className="mt-8 border-b border-gray-200 bg-white px-4 py-5 sm:px-6"
        >
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {responseBody.statusCode} {responseBody.description}
          </h3>
          <div className="mt-2">
            <div>
              <div className="mt-8 flex items-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <CodeIcon className="h-5 w-5" aria-hidden="true" />
                </span>

                <span className="text-md ml-2 font-medium leading-5 text-indigo-600"></span>

                <span className="ml-6 text-sm leading-5"></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ParameterType({ parameter }: { parameter: ApiSchemaParameter }) {
  const jsonSchema = parameter.validationSchema as any;

  if (jsonSchema) {
    return <span className="text-xs text-slate-500">({jsonSchema.type})</span>;
  }

  return null;
}

function ParameterTable({
  parameters,
  title,
}: {
  parameters: ApiSchemaParameter[];
  title: string;
}) {
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Schema
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Required
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {parameters.map((parameter) => (
                    <tr key={parameter.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                        {parameter.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <ParameterType parameter={parameter} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {parameter.required && (
                          <CheckCircleIcon className="w-6 text-gray-600" />
                        )}
                      </td>
                      <td className="prose prose-slate px-3 py-4">
                        {parameter.description && (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: marked(parameter.description),
                            }}
                          ></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
