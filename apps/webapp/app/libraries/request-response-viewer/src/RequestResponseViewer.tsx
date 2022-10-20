import { Tab } from "@headlessui/react";
import type { HTTPMethod, HttpRequestLog } from ".prisma/client";
import { StyledTabs } from "~/libraries/common";
import { SwitchPanelPositionButton } from "~/libraries/common/src/components/SwitchPanelPositionButton";
import type { PanelPosition } from "~/libraries/common/src/hooks/usePanelPosition";
import { RequestViewer } from "./RequestViewer";

type RequestResponseViewerProps = {
  log: HttpRequestLog;
  position: PanelPosition;
  setPosition: (position: PanelPosition) => void;
};

export function RequestResponseViewer({
  log,
  position,
  setPosition,
}: RequestResponseViewerProps) {
  return (
    <Tab.Group defaultIndex={1}>
      <Tab.List
        className={
          "flex items-center justify-between border-b border-slate-200 bg-slate-50"
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
        <SwitchPanelPositionButton
          className="mr-2"
          position={position}
          setPosition={setPosition}
          options={["right", "bottom", "left", "top"]}
        />
      </Tab.List>
      <Tab.Panels className="h-full">
        <Tab.Panel className={"h-full p-4"}>
          <RequestViewer
            requestHeaders={log.requestHeaders}
            requestBody={log.requestBody}
            status={log.statusCode}
            duration={log.requestDuration}
            responseSize={log.responseSize}
            params={log.params}
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
            params={log.params}
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
  method: HTTPMethod;
  url: string;
}) {
  return (
    <>
      {url.length <= 150 ? (
        <div className="mr-1 ml-1.5 flex min-w-0 max-w-fit flex-1 items-baseline overflow-hidden rounded-md border border-slate-200 bg-white px-2 py-1">
          <span className="mr-1 shrink-0 text-xs text-slate-900">{method}</span>
          <span className="flex-1 select-all overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-slate-900">
            {url}
          </span>
        </div>
      ) : (
        <div className="mr-1 ml-1.5 flex min-w-0 max-w-[700px] flex-1 items-baseline overflow-hidden rounded-md border border-slate-200 bg-white px-2 py-1">
          <span className="mr-1 shrink-0 text-xs text-slate-900">{method}</span>
          <span className="flex-1 select-all overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-slate-900">
            {url}
          </span>
        </div>
      )}
    </>
  );
}