import { useLogs } from "~/libraries/common/src/hooks/useLogs";
import { LogsFilters } from "~/libraries/ui/src/components/LogsFilters";
import { LogsTabs } from "~/libraries/ui/src/components/LogsTabs";

export default function Dashboard() {
  const logs = useLogs();
  return (
    <div>
      {logs && <LogsFilters logs={logs} />}
      <LogsTabs selected={"dashboard"} />
      Dashboard Index
    </div>
  );
}
