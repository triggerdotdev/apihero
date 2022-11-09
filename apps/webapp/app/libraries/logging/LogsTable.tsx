import { LogRow } from "../request-response-viewer/src/LogViewer";
import type { Log } from "internal-logs";

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
        {logs.map((log) => {
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
        })}
      </tbody>
    </table>
  );
}
