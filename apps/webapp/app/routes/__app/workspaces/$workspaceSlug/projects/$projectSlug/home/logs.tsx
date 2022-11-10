import { useSubmit, useTransition } from "@remix-run/react";
import { useCallback } from "react";
import {
  RefreshButton,
  PreviousButton,
  NextButton,
} from "~/libraries/common/src/components/Pagination";
import { useLogs } from "~/libraries/common/src/hooks/useLogs";
import { LogsTable } from "~/libraries/logging/LogsTable";

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

      if (direction === "previous" && logs.previous) {
        const previousApiUrl = new URL(logs.previous);
        const previousApiParams = Object.fromEntries(
          previousApiUrl.searchParams.entries()
        );
        pageSearchParams = {
          ...pageSearchParams,
          ...previousApiParams,
        };
      } else if (direction === "next" && logs.next) {
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
    [logs.next, logs.previous, submit]
  );

  return (
    <div>
      <div className="flex items-center justify-end">
        <RefreshButton
          disabled={false}
          onClick={() => reload()}
          lastUpdated={new Date()}
        />

        <PreviousButton
          disabled={
            logs.previous
              ? transition.state === "loading" ||
                transition.state === "submitting"
              : true
          }
          onClick={() => loadMore("previous")}
        />

        <NextButton
          disabled={
            logs.next
              ? transition.state === "loading" ||
                transition.state === "submitting"
              : true
          }
          onClick={() => loadMore("next")}
        />
      </div>
      <LogsTable
        logs={logs.logs}
        selectedLogId={undefined}
        onSelected={(logIg) => {}}
      />
    </div>
  );
}
