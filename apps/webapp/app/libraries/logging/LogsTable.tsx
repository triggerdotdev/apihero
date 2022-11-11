import { LogRow } from "../request-response-viewer/src/LogViewer";
import type { Log } from "internal-logs";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type LogsTableProps = {
  selectedLogId?: string;
  logs: Log[];
  onSelected: (logId: string) => void;
};

export function LogsTable({ logs, selectedLogId, onSelected }: LogsTableProps) {
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
            className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
          >
            Method
          </th>
          <th
            scope="col"
            className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
          >
            API
          </th>
          <th
            scope="col"
            className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6"
          >
            Path
          </th>
          <th
            scope="col"
            className="py-3 pl-4 pr-3 text-right text-xs font-semibold leading-tight text-slate-900 sm:pl-6"
          >
            Duration
          </th>
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
        {logs.length > 0 ? (
          logs.map((log) => {
            return (
              <LogRow
                key={log.id}
                log={log}
                isSelected={log.id === selectedLogId}
                onClick={() => {
                  onSelected(log.id);
                }}
              />
            );
          })
        ) : (
          <tr>
            <td colSpan={11} className="py-6 text-sm text-center">
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center p-3 gap-1 bg-yellow-200 border border-yellow-400 rounded-md text-yellow-700">
                  <ExclamationTriangleIcon className="w-4 h-4 " />
                  <span className="text-gray">
                    No logs match your current filters.
                  </span>
                </div>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
