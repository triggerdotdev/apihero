import type {
  ApiSchemaParameter,
  HttpRequestLog,
  Prisma,
} from ".prisma/client";
import classNames from "classnames";
import prettyBytes from "pretty-bytes";
import { StatusCode } from "~/libraries/ui/src/components/StatusCode";
import { CheckIcon } from "@heroicons/react/solid";
import { Mapping } from "@apihero/openapi-spec-generator/lib/generate";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "medium",
});

type LogViewerProps = {
  log: HttpRequestLog;
  parameters: ApiSchemaParameter[];
  isSelected: boolean;
  mappings: Mapping[];
  onClick: () => void;
};

export function LogRow({
  log,
  parameters,
  isSelected,
  onClick,
  mappings,
}: LogViewerProps) {
  return (
    <tr
      onClick={onClick}
      className={classNames(
        "w-full px-4 py-2 text-left ",
        isSelected
          ? " bg-blue-200 hover:bg-blue-100"
          : "bg-white hover:bg-slate-50"
      )}
    >
      <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
        {dateFormatter.format(new Date(log.createdAt))}
      </td>
      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
        <div className="flex gap-3 text-xs">
          {log.statusCode && (
            <StatusCode
              status={log.statusCode}
              skipMessage={true}
              fontClass="font-normal"
            />
          )}
        </div>
      </td>
      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-right font-mono text-xs text-slate-500 sm:pl-6">
        {log.requestDuration && formatDurationInMs(log.requestDuration)}
      </td>

      {parameters.map((parameter) => {
        return (
          <td
            key={parameter.id}
            className="whitespace-nowrap px-3 py-2 text-xs text-slate-500"
          >
            {log.params &&
              formatParameterValue(
                getMappedParamValue(
                  parameter.name,
                  log.params as Record<string, any>,
                  mappings
                )
              )}
          </td>
        );
      })}

      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-500">
        {prettyBytes(log.responseSize)}
      </td>
      <td className="whitespace-nowrap py-2 pl-4 pr-3 font-mono text-xs text-slate-500">
        {log.id}
      </td>

      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs text-slate-500 sm:pl-6">
        {log.isCacheHit && <CheckIcon className="h-4 w-4" />}
      </td>

      <td className="whitespace-nowrap py-2 pl-4 pr-3 font-mono text-xs text-slate-500">
        {log.isCacheHit ? (
          "—"
        ) : hasRateLimitHeaders(log.responseHeaders, [
            "x-ratelimit-remaining",
            "x-ratelimit-limit",
          ]) ||
          hasRateLimitHeaders(log.responseHeaders, [
            "x-rate-limit-remaining",
            "x-rate-limit-limit",
          ]) ? (
          <>
            {getRateLimitHeader(log.responseHeaders, [
              "x-ratelimit-remaining",
              "x-rate-limit-remaining",
            ])}
            /
            {getRateLimitHeader(log.responseHeaders, [
              "x-ratelimit-limit",
              "x-rate-limit-limit",
            ])}
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs text-slate-500">
        {log.isCacheHit ? (
          <span className="font-mono">—</span>
        ) : getRateLimitReset(log.responseHeaders) ? (
          dateFormatter.format(getRateLimitReset(log.responseHeaders))
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

const durationFormatter = Intl.NumberFormat("en-US");

function formatDurationInMs(duration: number) {
  return `${durationFormatter.format(Math.round(duration * 10) / 10)}ms`;
}

type RateLimitHeaderName =
  | "x-ratelimit-remaining"
  | "x-ratelimit-used"
  | "x-ratelimit-limit"
  | "x-rate-limit-remaining"
  | "x-rate-limit-used"
  | "x-rate-limit-limit";

function hasRateLimitHeaders(
  headers: Prisma.JsonValue,
  headerName: Array<RateLimitHeaderName>
): boolean {
  if (!headers) {
    return false;
  }

  if (typeof headers !== "object") {
    return false;
  }

  if (headers === null) {
    return false;
  }

  return headerName.every(
    (name) => typeof getRateLimitHeader(headers, name) !== "undefined"
  );
}

function getRateLimitHeader(
  headers: Prisma.JsonValue,
  headerName: Array<RateLimitHeaderName> | RateLimitHeaderName
): number | undefined {
  if (Array.isArray(headers)) {
    return;
  }

  if (Array.isArray(headerName)) {
    for (const name of headerName) {
      const value = getRateLimitHeader(headers, name);

      if (value !== undefined) {
        return value;
      }
    }

    return;
  }

  if (typeof headers !== "object") {
    return;
  }

  if (headers === null) {
    return;
  }

  const remaining = headers[headerName];

  if (typeof remaining !== "string") {
    return;
  }

  return Number(remaining);
}

function getRateLimitReset(headers: Prisma.JsonValue): Date | undefined {
  if (Array.isArray(headers)) {
    return;
  }

  if (typeof headers !== "object") {
    return;
  }

  if (headers === null) {
    return;
  }

  const remaining =
    headers["x-ratelimit-reset"] ?? headers["x-rate-limit-reset"];

  if (typeof remaining !== "string") {
    return;
  }

  return new Date(Number(remaining) * 1000);
}

function getMappedParamValue(
  name: string,
  params: Record<string, any>,
  mappings: Mapping[]
): any {
  if (!mappings || !mappings.length) {
    return params[name];
  }

  const mapping = mappings.find(
    (m) => m.type === "parameter" && m.name === name
  );

  if (!mapping) {
    return params[name];
  }

  return params[mapping.mappedName];
}

function formatParameterValue(value: any): string {
  if (typeof value === "undefined") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(",");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
