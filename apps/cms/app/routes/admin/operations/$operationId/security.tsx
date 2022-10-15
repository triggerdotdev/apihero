import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { findSecurityRequirementsByOperationId } from "~/models/security.server";
import {
  useOperationData,
  LoaderData as OperationLoaderData,
} from "../$operationId";

type LoaderData = {
  securityRequirements: Awaited<
    ReturnType<typeof findSecurityRequirementsByOperationId>
  >;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { operationId } = params;

  invariant(operationId, "operationId is required");

  const securityRequirements = await findSecurityRequirementsByOperationId(
    operationId
  );

  return {
    securityRequirements,
  };
};

export default function OperationSecurityRoute() {
  const { securityRequirements } = useLoaderData<LoaderData>();
  const operation = useOperationData();

  return (
    <div className="mx-auto w-full sm:px-6 lg:px-8">
      <div className="mb-6 mt-4 text-xl font-medium">Security Requirements</div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Name / Location
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      HTTP Scheme
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Bearer Format
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Scopes
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {securityRequirements.map((securityRequirement) => (
                    <tr key={securityRequirement.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {securityRequirement.securityScheme.identifier}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {securityRequirement.securityScheme.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {securityRequirement.securityScheme.name &&
                          securityRequirement.securityScheme.location && (
                            <>
                              {securityRequirement.securityScheme.name} /{" "}
                              {securityRequirement.securityScheme.location}
                            </>
                          )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {securityRequirement.securityScheme.httpScheme}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {securityRequirement.securityScheme.bearerFormat}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {securityRequirement.scopes
                          .map((scope) => scope.name)
                          .join(", ")}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"></td>
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
