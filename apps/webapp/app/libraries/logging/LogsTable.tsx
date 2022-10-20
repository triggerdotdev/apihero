import type { Mapping } from "@apihero/openapi-spec-generator/lib/generate";
import type { ApiSchemaParameter, HttpRequestLog } from ".prisma/client";
import { LogRow } from "../request-response-viewer/src/LogViewer";

type LogsTableProps = {
  selectedLogId: string | null;
  variables: ApiSchemaParameter[];
  logs: HttpRequestLog[];
  mappings: Mapping[];
  onSelected: (logId: string) => void;
};

export function LogsTable({
  variables,
  logs,
  selectedLogId,
  onSelected,
  mappings,
}: LogsTableProps) {
  return (
    <table className="w-full divide-y divide-slate-300">
      <thead className="sticky top-0 bg-white outline outline-2 outline-slate-200">
        <tr>
          <th
            scope="col"
            className="px-3 py-3 text-left text-xs font-semibold text-slate-900"
          >
            Timestamp
          </th>
          <th
            scope="col"
            className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
          >
            Status
          </th>
          <th
            scope="col"
            className="py-3 pl-4 pr-3 text-right text-xs font-semibold leading-tight text-slate-900 sm:pl-6"
          >
            Duration
          </th>

          {variables.map((variable) => {
            return (
              <th
                key={variable.id}
                scope="col"
                className="py-3 pl-2 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-3"
              >
                {`{${variable.name}}`}
              </th>
            );
          })}
          <th
            scope="col"
            className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold leading-tight text-slate-900"
          >
            Response Size
          </th>
          <th
            scope="col"
            className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold leading-tight text-slate-900"
          >
            Request ID
          </th>
          <th
            scope="col"
            className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
          >
            Cached
          </th>
          <th
            scope="col"
            className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold leading-tight text-slate-900"
          >
            Rate Limit
          </th>
          <th
            scope="col"
            className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold leading-tight text-slate-900"
          >
            Resets at
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white">
        {logs.map((log) => {
          return (
            <LogRow
              key={log.id}
              log={log}
              parameters={variables}
              mappings={mappings}
              isSelected={log.id === selectedLogId}
              onClick={() => {
                onSelected(log.id);
              }}
            />
          );
        })}
      </tbody>
    </table>
  );
}
