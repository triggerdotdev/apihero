import { useSubmit, useTransition } from "@remix-run/react";
import type { Log } from "internal-logs";
import { useCallback, useMemo, useState } from "react";
import {
  RefreshButton,
  PreviousButton,
  NextButton,
} from "~/libraries/common/src/components/Pagination";
import { useLogs } from "~/libraries/common/src/hooks/useLogs";
import type { PanelPosition } from "~/libraries/common/src/hooks/usePanelPosition";
import { usePanelPosition } from "~/libraries/common/src/hooks/usePanelPosition";
import { LogsTable } from "~/libraries/logging/LogsTable";
import { RequestResponseViewer } from "~/libraries/request-response-viewer";
import { LogsFilters } from "~/libraries/ui/src/components/LogsFilters";
import { LogsTabs } from "~/libraries/ui/src/components/LogsTabs";
import { Body } from "~/libraries/ui/src/components/Primitives/Body";
import Resizable from "~/libraries/ui/src/components/Resizable";

export default function Logs() {
  const logs = useLogs();
  const submit = useSubmit();
  const transition = useTransition();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const [position, setPosition] = usePanelPosition({
    defaultPosition: "right",
    key: "logs",
  });

  const reload = useCallback(() => {
    document.location.reload();
  }, []);

  const loadMore = useCallback(
    (direction: "previous" | "next") => {
      const pageUrl = new URL(document.location.href);
      let pageSearchParams = Object.fromEntries(pageUrl.searchParams.entries());

      if (direction === "previous" && logs?.previous) {
        const previousApiUrl = new URL(logs.previous);
        const previousApiParams = Object.fromEntries(
          previousApiUrl.searchParams.entries()
        );
        pageSearchParams = {
          ...pageSearchParams,
          ...previousApiParams,
        };
      } else if (direction === "next" && logs?.next) {
        const nextApiUrl = new URL(logs.next);
        const nextApiParams = Object.fromEntries(
          nextApiUrl.searchParams.entries()
        );
        pageSearchParams = {
          ...pageSearchParams,
          ...nextApiParams,
        };
      } else {
        return;
      }

      submit(pageSearchParams, {
        method: "get",
        action: pageUrl.origin + pageUrl.pathname,
      });
    },
    [logs, submit]
  );

  const onLogSelected = useCallback(
    (logId: string) => {
      if (selectedLog === logId) {
        setSelectedLog(null);
      } else {
        setSelectedLog(logId);
      }
    },
    [selectedLog]
  );

  const openLog = useMemo(() => {
    return logs?.logs.find((e) => e.id === selectedLog);
  }, [logs, selectedLog]);

  return (
    <div>
      {logs && (
        <>
          <LogsFilters logs={logs} />
          <LogsTabs selected={"logs"} />
          <div className="flex h-full w-[calc(100vw-130px)] overflow-hidden">
            <div className="flex h-full w-full flex-col justify-between overflow-auto">
              <div className="h-[calc(100%-36px)] overflow-auto">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <PreviousButton
                      disabled={
                        logs.previous !== undefined
                          ? transition.state === "loading" ||
                            transition.state === "submitting"
                          : true
                      }
                      onClick={() => loadMore("previous")}
                    />

                    <NextButton
                      disabled={
                        logs.next !== undefined
                          ? transition.state === "loading" ||
                            transition.state === "submitting"
                          : true
                      }
                      onClick={() => loadMore("next")}
                    />
                  </div>

                  <RefreshButton
                    disabled={false}
                    onClick={() => reload()}
                    lastUpdated={new Date()}
                  />
                </div>
                <LogsTable
                  logs={logs.logs}
                  selectedLogId={undefined}
                  onSelected={onLogSelected}
                />
              </div>
            </div>
            {position === "right" && (
              <Resizable
                position="right"
                initialSize={600}
                minimumSize={270}
                maximumSize={950}
              >
                <LogViewer
                  log={openLog}
                  position={position}
                  setPosition={setPosition}
                />
              </Resizable>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LogViewer({
  log,
  position,
  setPosition,
}: {
  log: Log | undefined;
  position: PanelPosition;
  setPosition: (position: PanelPosition) => void;
}) {
  return (
    <div className="h-full bg-white">
      {log ? (
        <RequestResponseViewer
          log={log}
          position={position}
          setPosition={setPosition}
        />
      ) : (
        <NoLogSelected />
      )}
    </div>
  );
}

function NoLogSelected() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Body className="text-center">Select a log to view details</Body>
    </div>
  );
}
