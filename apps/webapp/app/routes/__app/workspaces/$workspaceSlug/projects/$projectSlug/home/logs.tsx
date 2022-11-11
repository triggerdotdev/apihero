import { useSubmit, useTransition } from "@remix-run/react";
import { useCallback } from "react";
import {
  RefreshButton,
  PreviousButton,
  NextButton,
} from "~/libraries/common/src/components/Pagination";
import { useLogs } from "~/libraries/common/src/hooks/useLogs";
import { LogsTable } from "~/libraries/logging/LogsTable";
import { LogsFilters } from "~/libraries/ui/src/components/LogsFilters";
import { LogsTabs } from "~/libraries/ui/src/components/LogsTabs";

export default function Logs() {
  const logs = useLogs();
  const submit = useSubmit();
  const transition = useTransition();

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

  return (
    <div>
      {logs && (
        <>
          <LogsFilters logs={logs} />
          <LogsTabs selected={"logs"} />
          <div className="flex items-center justify-between">
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
            onSelected={(logIg) => {}}
          />
        </>
      )}
    </div>
  );
}
