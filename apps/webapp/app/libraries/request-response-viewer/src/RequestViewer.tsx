import { Tab } from "@headlessui/react";
import { JSONEditor, KeyValueList, StyledTabs } from "~/libraries/common";
import { JSONHeroButton } from "~/libraries/common/src/components/JSONHeroButton";
import { ResponseInfo } from "~/libraries/ui";
import type { Json } from "internal-logs";

type RequestViewerProps = {
  requestHeaders?: Json;
  requestBody?: Json;
  status: number;
  duration?: number;
  responseSize?: number;
  type: "request" | "response";
  logId: string;
};

export function RequestViewer({
  requestHeaders,
  requestBody,
  status,
  duration,
  responseSize,
  type,
  logId,
}: RequestViewerProps) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <Tab.Group>
        <Tab.List className={"-mb-px flex flex-shrink-0 flex-grow-0"}>
          <div className="flex w-full flex-wrap-reverse justify-between border-b border-slate-200">
            <div className="flex max-w-fit">
              <StyledTabs.Underlined disabled={requestBody == null}>
                Body
              </StyledTabs.Underlined>
              <StyledTabs.Underlined>Headers</StyledTabs.Underlined>
            </div>
          </div>
        </Tab.List>
        <Tab.Panels className="flex-grow overflow-y-auto">
          <Tab.Panel className="relative h-full">
            {requestBody == null ? (
              <div>No body</div>
            ) : (
              <>
                <JSONEditor
                  content={JSON.stringify(requestBody, null, 2)}
                  readOnly={true}
                  className="h-[calc(100%-40px)]"
                />
                <div className="absolute bottom-10 right-0">
                  <JSONHeroButton
                    to={`/requestLog/${logId}/${
                      type === "request" ? "requestBody" : "responseBody"
                    }`}
                  />
                </div>
              </>
            )}
          </Tab.Panel>
          <Tab.Panel>
            <KeyValueList
              data={
                requestHeaders === undefined
                  ? {}
                  : (requestHeaders as Record<string, string>)
              }
              keyTitle="Header"
              showTitle={false}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
