import { Tab } from "@headlessui/react";
import type { Prisma } from ".prisma/client";
import { JSONEditor, KeyValueList, StyledTabs } from "~/libraries/common";
import { JSONHeroButton } from "~/libraries/common/src/components/JSONHeroButton";
import {
  isJsonObject,
  isStringRecord,
} from "~/libraries/common/src/utilities/prisma-utilities";
import { ResponseInfo } from "~/libraries/ui";
import { InputParameters } from "./InputParameters";

type RequestViewerProps = {
  requestHeaders: Prisma.JsonValue;
  requestBody: Prisma.JsonValue;
  status: number;
  duration?: number;
  responseSize?: number;
  params: Prisma.JsonValue;
  type: "request" | "response";
  logId: string;
};

export function RequestViewer({
  requestHeaders,
  requestBody,
  status,
  duration,
  responseSize,
  params,
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
              <StyledTabs.Underlined>Input params</StyledTabs.Underlined>
            </div>
            <div className="flex w-full max-w-fit items-center">
              <ResponseInfo
                status={status}
                duration={duration}
                responseSize={responseSize}
              />
            </div>
          </div>
        </Tab.List>
        <Tab.Panels className="flex-grow overflow-y-auto">
          <Tab.Panel className="relative h-full">
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
          </Tab.Panel>
          <Tab.Panel>
            <KeyValueList
              data={isStringRecord(requestHeaders) ? requestHeaders : {}}
              keyTitle="Header"
              showTitle={false}
            />
          </Tab.Panel>
          <Tab.Panel>
            <InputParameters variables={isJsonObject(params) ? params : {}} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
