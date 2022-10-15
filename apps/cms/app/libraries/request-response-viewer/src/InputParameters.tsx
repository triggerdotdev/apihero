import type { JsonObject } from "~/libraries/common/src/utilities/prisma-utilities";

type InputParametersProps = {
  variables: JsonObject;
};

export function InputParameters({ variables }: InputParametersProps) {
  return (
    <div className="min-w-fit border border-slate-200 px-4 py-2">
      <table className="mt-3">
        <thead className="mb-4">
          <tr>
            <th
              scope="col"
              className="pr-6 text-left text-xs font-normal uppercase tracking-wide text-slate-400"
            >
              Parameter
            </th>
            <th
              scope="col"
              className="text-left text-xs font-normal uppercase tracking-wide text-slate-400"
            >
              Value
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {Object.entries(variables).map((variable) => {
            return (
              <tr key={variable[0]}>
                <td className="py-1 text-left text-xs font-normal text-slate-800">
                  {variable[0]}
                </td>
                <td className="py-1 text-left text-xs font-normal text-slate-800">
                  {JSON.stringify(variable[1])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
