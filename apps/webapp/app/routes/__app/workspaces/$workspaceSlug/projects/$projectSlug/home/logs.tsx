import { InformationCircleIcon } from "@heroicons/react/24/outline";
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
    <>
      {logs && (
        <div className="h-full grid grid-rows-[auto_3fr]">
          <div className="">
            <LogsFilters logs={logs} />
            <LogsTabs selected={"logs"} />
          </div>
          <div className="grid grid-cols-[1fr_200px] overflow-hidden">
            <div className="grid grid-row-[1fr_auto] overflow-hidden">
              <div className="overflow-hidden border-b border-slate-200">
                <div className="flex items-center justify-between mt-1 pr-2 py-[5px]">
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
                <div className="overflow-auto h-full border-y border-l border-slate-200">
                  <LogsTable
                    logs={logs.logs}
                    selectedLogId={selectedLog ?? undefined}
                    onSelected={onLogSelected}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-auto bg-blue-200">
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
            </div>
          </div>
        </div>
      )}
    </>
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
    <div className="h-full bg-white mt-px">
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
    <div className="flex h-full w-full flex-col gap-2 items-center justify-center">
      <InformationCircleIcon className="h-8 w-8" />
      <Body className="text-center text-slate-600">
        Select a log to view details
      </Body>
    </div>
  );
}
