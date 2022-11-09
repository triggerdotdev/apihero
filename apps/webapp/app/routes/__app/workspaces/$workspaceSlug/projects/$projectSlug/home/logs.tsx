import { useLogs } from "~/libraries/common/src/hooks/useLogs";
import { LogsTable } from "~/libraries/logging/LogsTable";

export default function Logs() {
  const logs = useLogs();

  return (
    <div>
      <LogsTable
        logs={logs}
        selectedLogId={undefined}
        onSelected={(logIg) => {}}
      />
    </div>
  );
}
