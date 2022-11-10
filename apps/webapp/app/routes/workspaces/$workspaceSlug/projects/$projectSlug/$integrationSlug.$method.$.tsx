import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { HomeIcon } from "@heroicons/react/24/solid";
import type { HttpRequestLog } from ".prisma/client";
import { Link, useParams, useSubmit, useTransition } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { DateRangeSelector } from "~/components/filters/DateRangeSelector";
import {
  dateFromSearchParams,
  dateToString,
  rangeToSerializedDateRange,
  serializedDateRangeToRange,
} from "~/libraries/common";
import {
  RefreshButton,
  PreviousButton,
  NextButton,
} from "~/libraries/common/src/components/Pagination";
import type { PanelPosition } from "~/libraries/common/src/hooks/usePanelPosition";
import { usePanelPosition } from "~/libraries/common/src/hooks/usePanelPosition";
import { LogsTable } from "~/libraries/logging/LogsTable";
import { RequestResponseViewer } from "~/libraries/request-response-viewer";
import { Footer, Header } from "~/libraries/ui";
import { Body } from "~/libraries/ui/src/components/Primitives/Body";
import Resizable from "~/libraries/ui/src/components/Resizable";
import { getHttpClientFromIntegrationSlug } from "~/models/httpClient.server";
import { getEndpoint, isHttpMethod } from "~/models/httpEndpoint.server";
import { getProjectFromSlugs } from "~/models/project.server";
import { getLogs } from "~/models/requestLog.server";
import { requireUserId } from "~/services/session.server";
import { parseMappingsValue } from "~/utils/parseMappingsValue";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  const { projectSlug, workspaceSlug, integrationSlug, method } = params;
  const operationId = params["*"];
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");
  invariant(integrationSlug, "integrationSlug not found");
  invariant(method, "method not found");
  invariant(operationId, "operationId is null or empty");
  const project = await getProjectFromSlugs({
    workspaceSlug,
    slug: projectSlug,
  });

  const client = await getHttpClientFromIntegrationSlug(
    workspaceSlug,
    projectSlug,
    integrationSlug
  );

  if (!client) {
    throw new Response("Client not Found", { status: 404 });
  }

  if (!isHttpMethod(method)) {
    throw new Response("Method not Found", { status: 404 });
  }

  const endpoint = await getEndpoint(client.id, method, operationId);
  if (!endpoint) {
    throw new Response("Endpoint not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const dateRange = dateFromSearchParams(url.searchParams);

  let direction: "previous" | "next" | undefined;
  const directionParam = url.searchParams.get("direction");
  if (directionParam) {
    direction = directionParam as "previous" | "next";
  }

  const cursor = url.searchParams.get("cursor") ?? undefined;

  const startDateString = dateToString(dateRange.start);
  const endDateString = dateToString(dateRange.end);

  const logs = await getLogs({
    endpointId: endpoint.id,
    startDate: startDateString,
    endDate: endDateString,
    cursor,
    direction,
  });

  return typedjson({
    endpoint,
    logs,
    dateRange: rangeToSerializedDateRange(dateRange),
    variables: endpoint.operation.parameters,
    client,
    project,
  });
}

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();
  const submit = useSubmit();
  const transition = useTransition();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const { workspaceSlug, projectSlug } = useParams();

  const [position, setPosition] = usePanelPosition({
    defaultPosition: "right",
    key: "logs",
  });

  useEffect(() => {
    setSelectedLog(data.logs.logs[0]?.id);
  }, [data.logs]);

  const loadMore = useCallback(
    (direction: "previous" | "next") => {
      let params: any = {
        ...data.dateRange,
      };

      if (direction === "next" && data.logs.cursors.next) {
        params = {
          ...params,
          direction: "next",
          cursor: data.logs.cursors.next,
        };
      } else if (direction === "previous" && data.logs.cursors.previous) {
        params = {
          ...params,
          direction: "previous",
          cursor: data.logs.cursors.previous,
        };
      } else {
        console.error("No cursor", data.logs);
      }

      const url = new URL(document.location.href);

      submit(params, { method: "get", action: url.origin + url.pathname });
    },
    [data.dateRange, data.logs, submit]
  );

  const reload = useCallback(() => {
    document.location.reload();
  }, []);

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
    return data.logs.logs.find((e) => e.id === selectedLog);
  }, [data.logs, selectedLog]);

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      <Header>
        <div className="flex flex-row items-center ">
          <Link to={`/workspaces/${workspaceSlug}/projects/${projectSlug}`}>
            <h2 className="flex px-2 py-0.5 capitalize text-blue-500 transition hover:rounded-sm hover:bg-blue-50 hover:text-blue-600">
              {data.project?.title}
            </h2>
          </Link>
          <span className="-ml-1">/</span>
          <h2 className="ml-1">{data.endpoint.operation.summary}</h2>

          {/* <EndpointSelector
            currentEndpoint={data.client?.endpoint}
            endpoints={data.client.endpoints}
          /> */}
        </div>
      </Header>
      <div className="flex h-full w-full overflow-hidden">
        {position === "left" && (
          <Resizable
            position="left"
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
        <div className="flex h-full w-full flex-col justify-between overflow-auto bg-slate-50">
          {position === "top" && (
            <Resizable
              position="top"
              initialSize={400}
              minimumSize={100}
              maximumSize={900}
            >
              <LogViewer
                log={openLog}
                position={position}
                setPosition={setPosition}
              />
            </Resizable>
          )}
          <div className="m-1 h-full overflow-hidden">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DateRangeSelector
                  range={serializedDateRangeToRange(data.dateRange)}
                  presets={[1, 7, 30, 90, 365]}
                />
                {/* <FilterMenu /> */}
              </div>
              <div className="flex items-center justify-end">
                <RefreshButton
                  disabled={false}
                  onClick={() => reload()}
                  lastUpdated={new Date()}
                />

                <PreviousButton
                  disabled={
                    data.logs.cursors.previous
                      ? transition.state === "loading" ||
                        transition.state === "submitting"
                      : true
                  }
                  onClick={() => loadMore("previous")}
                />

                <NextButton
                  disabled={
                    data.logs.cursors.next
                      ? transition.state === "loading" ||
                        transition.state === "submitting"
                      : true
                  }
                  onClick={() => loadMore("next")}
                />
              </div>
            </div>
            <div className="h-[calc(100%-36px)] overflow-auto rounded-lg border border-slate-200 bg-white">
              {data.logs.logs.length > 0 ? (
                // <LogsTable
                //   variables={data.variables}
                //   logs={data.logs.logs}
                //   selectedLogId={selectedLog}
                //   onSelected={onLogSelected}
                //   mappings={parseMappingsValue(
                //     data.endpoint.operation.mappings
                //   )}
                // />
                <></>
              ) : (
                <NoLogsPanel />
              )}
            </div>
          </div>

          {position === "bottom" && (
            <Resizable
              position="bottom"
              initialSize={400}
              minimumSize={100}
              maximumSize={900}
            >
              <LogViewer
                log={openLog}
                position={position}
                setPosition={setPosition}
              />
            </Resizable>
          )}
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
      <Footer />
    </div>
  );
}

function LogViewer({
  log,
  position,
  setPosition,
}: {
  log: HttpRequestLog | undefined;
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

function NoLogsPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Body className="text-center">No logs for this time period</Body>
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
