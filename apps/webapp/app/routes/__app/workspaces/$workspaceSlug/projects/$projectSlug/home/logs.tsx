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
        // <div className="grid grid-rows-[auto_1fr]">
        //   <div className="bg-yellow-100">
        //     <LogsFilters logs={logs} />
        //     <LogsTabs selected={"logs"} />
        //   </div>
        //   <div className="grid grid-cols-[1fr_600px] bg-orange-50 max-h-full overflow-hidden">
        //     <div className="overflow-hidden">
        //       <div className="flex items-center justify-between pr-2 py-[5px] bg-slate-50">
        //         <div className="flex items-center">
        //           <PreviousButton
        //             disabled={
        //               logs.previous !== undefined
        //                 ? transition.state === "loading" ||
        //                   transition.state === "submitting"
        //                 : true
        //             }
        //             onClick={() => loadMore("previous")}
        //           />

        //           <NextButton
        //             disabled={
        //               logs.next !== undefined
        //                 ? transition.state === "loading" ||
        //                   transition.state === "submitting"
        //                 : true
        //             }
        //             onClick={() => loadMore("next")}
        //           />
        //         </div>

        //         <RefreshButton
        //           disabled={false}
        //           onClick={() => reload()}
        //           lastUpdated={new Date()}
        //         />
        //       </div>
        //       <div className="overflow-scroll bg-green-100">
        //         <LogsTable
        //           logs={logs.logs}
        //           selectedLogId={selectedLog ?? undefined}
        //           onSelected={onLogSelected}
        //         />
        //       </div>
        //     </div>
        //     <Resizable
        //       position="right"
        //       initialSize={600}
        //       minimumSize={270}
        //       maximumSize={950}
        //     >
        //       <LogViewer
        //         log={openLog}
        //         position={position}
        //         setPosition={setPosition}
        //       />
        //     </Resizable>
        //   </div>
        // </div>

        <div className="main-container h-full grid grid-cols-[3fr_1fr] bg-red-100">
          <div className="col-1 grid overflow-auto grid-rows-[1fr_1fr]">
            <div className="row-1 grid grid-rows-[1fr_2fr] overflow-auto bg-green-100">
              <div className="row-1-1 overflow-auto bg-blue-100">
                <div className="test-height">row-1-1</div>
              </div>
              <div className="row-1-2 overflow-auto bg-yellow-100">
                <div className="test-height h-[1000px]">row-1-2</div>
              </div>
            </div>
            <div className="row-2 bg-orange-100 overflow-auto grid grid-rows-[3fr_1fr]">
              <div className="row-2-1 overflow-auto bg-lime-100">
                <div className="test-height h-[1000px]">row-2-1</div>
              </div>
              <div className="row-2-2 overflow-auto bg-indigo-100">
                <div className="test-height h-[1000px]">row-2-2</div>
              </div>
            </div>
          </div>
          <div className="col-2 grid grid-rows-[90px_1fr_90px] overflow-auto">
            <div className="row-3 bg-emerald-100"></div>
            <div className="row-4 grid grid-rows-[1fr] overflow-auto bg-stone-200">
              <div className="row-4-1 grid grid-rows-[1fr] overflow-auto p-5">
                <div className="text-editor grid grid-rows-[auto_1fr] overflow-auto">
                  <div className="toolbar bg-black text-white">Toolbar</div>
                  <div className="content overflow-auto bg-amber-200">
                    <div className="test-height h-[1000px]">Text content</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row-5 bg-red-100"></div>
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
      <InformationCircleIcon className="h-8 w-8 text-blue-500" />
      <Body className="text-center text-slate-600">
        Select a log to view details
      </Body>
    </div>
  );
}
