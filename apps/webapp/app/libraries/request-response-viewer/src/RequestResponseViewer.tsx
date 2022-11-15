import { Tab } from "@headlessui/react";
import type { HttpMethod, Log } from "internal-logs";
import { StyledTabs } from "~/libraries/common";
import { RequestViewer } from "./RequestViewer";

type RequestResponseViewerProps = {
  log: Log;
};

export function RequestResponseViewer({ log }: RequestResponseViewerProps) {
  return (
    <Tab.Group defaultIndex={1}>
      <Tab.List
        className={
          "flex sticky top-[1px] items-center justify-between border-b border-slate-200 bg-slate-50"
        }
      >
        <div className="-mb-px flex">
          <StyledTabs.Classic>Request</StyledTabs.Classic>
          <StyledTabs.Classic>Response</StyledTabs.Classic>
        </div>
        <RequestUrlBar
          method={log.method}
          url={`${log.baseUrl}${log.path}${log.search ? log.search : ``}`}
        />
        <div></div>
      </Tab.List>
      <Tab.Panels className="h-full">
        <Tab.Panel className={"h-full p-4"}>
          <RequestViewer
            requestHeaders={log.requestHeaders}
            requestBody={log.requestBody}
            status={log.statusCode}
            duration={log.requestDuration}
            responseSize={log.responseSize}
            type="request"
            logId={log.id}
          />
        </Tab.Panel>
        <Tab.Panel className={"h-full p-4"}>
          <RequestViewer
            requestHeaders={log.responseHeaders}
            requestBody={log.responseBody}
            status={log.statusCode}
            duration={log.requestDuration}
            responseSize={log.responseSize}
            type="response"
            logId={log.id}
          />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}

export function RequestUrlBar({
  method,
  url,
}: {
  method: HttpMethod;
  url: string;
}) {
  return (
    <>
      {url.length <= 150 ? (
        <div className="mr-1 ml-1.5 flex max-w-fit flex-1 items-baseline overflow-hidden rounded-md border border-slate-200 bg-white px-2 py-1">
          <span className="mr-1 shrink-0 text-xs text-slate-600">{method}</span>
          <span className="flex-1 select-all overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-slate-600">
            {url}
          </span>
        </div>
      ) : (
        <div className="mr-1 ml-1.5 flex min-w-0 max-w-[700px] flex-1 items-baseline overflow-hidden rounded-md border border-slate-200 bg-white px-2 py-1">
          <span className="mr-1 shrink-0 text-xs text-slate-600">{method}</span>
          <span className="flex-1 select-all overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-slate-900">
            {url}
          </span>
        </div>
      )}
    </>
  );
}
