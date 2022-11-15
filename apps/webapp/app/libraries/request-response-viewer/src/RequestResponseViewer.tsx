import { Tab } from "@headlessui/react";
import type { HttpMethod, Log } from "internal-logs";
import { StyledTabs } from "~/libraries/common";
import { ResponseInfo } from "~/libraries/ui";
import { RequestViewer } from "./RequestViewer";

type RequestResponseViewerProps = {
  log: Log;
};

export function RequestResponseViewer({ log }: RequestResponseViewerProps) {
  return (
    <Tab.Group defaultIndex={1}>
      <div className="bg-slate-50 p-1">
        <RequestUrlBar
          method={log.method}
          url={`${log.baseUrl}${log.path}${log.search ? log.search : ``}`}
        />
      </div>
      <Tab.List
        className={
          "flex sticky items-center justify-between border-b border-slate-200 bg-slate-50"
        }
      >
        <div className="-mb-px flex">
          <StyledTabs.Classic>Request</StyledTabs.Classic>
          <StyledTabs.Classic>Response</StyledTabs.Classic>
        </div>
        <div className="flex w-full max-w-fit items-center">
          <ResponseInfo
            status={log.statusCode}
            duration={log.gatewayDuration}
            responseSize={log.responseSize}
          />
        </div>
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
    <div className="flex min-w-0 items-baseline rounded-md border border-slate-200 bg-white p-2 gap-1">
      <span className="shrink-0 text-xs text-slate-600 font-semibold">
        {method}
      </span>
      <span className="flex-1 select-all overflow-ellipsis whitespace-nowrap text-sm text-slate-900">
        {url}
      </span>
    </div>
  );
}
