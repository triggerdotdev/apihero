import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import classNames from "classnames";
import { GetCachedResponseSchema } from "internal-logs";
import { useRef, useCallback } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { DateRangeSelector } from "~/components/filters/DateRangeSelector";
import { FormField } from "~/libraries/ui/src/components/Primitives/FormField";
import { getProjectFromSlugs } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { projectSlug, workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  invariant(projectSlug, "projectSlug not found");

  const project = await getProjectFromSlugs({
    workspaceSlug,
    slug: projectSlug,
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const logsOrigin = process.env.LOGS_ORIGIN;
  invariant(logsOrigin, "LOGS_ORIGIN env variables not defined");
  const authenticationToken = process.env.LOGS_API_AUTHENTICATION_TOKEN;
  invariant(
    authenticationToken,
    "LOGS_API_AUTHENTICATION_TOKEN env variables not defined"
  );

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const searchObject = Object.fromEntries(searchParams.entries());

  if (searchObject.days === undefined && searchObject.start === undefined) {
    searchParams.set("days", "7");
  }

  const apiUrl = `${logsOrigin}/caching/${
    project.id
  }?${searchParams.toString()}`;

  try {
    const cachedResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`,
      },
    });

    const json = await cachedResponse.json();
    const body = await GetCachedResponseSchema.parseAsync(json);

    return typedjson(body, { status: cachedResponse.status });
  } catch (error: any) {
    console.error(error);
    return typedjson({
      statusCode: 500,
      error: JSON.stringify(error),
      message: error.message as string,
    });
  }
};

const headerCell = "px-2 py-3 text-left text-xs font-semibold text-slate-900";
const headerCellRightAlign = classNames(headerCell, "text-right");

const cell = "whitespace-nowrap py-2 px-2 text-xs text-slate-500";
const cellLeftAligned = classNames(cell, "text-left");
const cellRightAligned = classNames(cell, "text-right");

export default function Caching() {
  const data = useTypedLoaderData<typeof loader>();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams] = useSearchParams();
  const searchObject = Object.fromEntries(searchParams.entries());

  const submitForm = useCallback(() => {
    if (!formRef.current) return;
    submit(formRef.current, { replace: true });
  }, [submit]);

  return (
    <div className="p-4 w-full bg-slate-50">
      <div className="pb-2">
        <FormField label={"Date range"} name={"date"}>
          <Form
            method="get"
            className="pb-4 flex gap-2"
            onChange={submitForm}
            ref={formRef}
          >
            <DateRangeSelector
              searchObject={searchObject}
              presets={[1, 7, 30, 90, 365]}
              submitForm={submitForm}
            />
          </Form>
        </FormField>
      </div>
      {"records" in data && (
        <table className="w-full divide-y divide-slate-300 outline outline-slate-200 rounded">
          <thead className="sticky top-0 bg-white outline outline-slate-200">
            <tr>
              <th scope="col" className={headerCell}>
                API
              </th>
              <th scope="col" className={headerCellRightAlign}>
                Hit rate
              </th>
              <th scope="col" className={headerCellRightAlign}>
                Hits <span className="font-normal">(p50)</span>
              </th>
              <th scope="col" className={headerCellRightAlign}>
                Misses <span className="font-normal">(p50)</span>
              </th>
              <th scope="col" className={headerCellRightAlign}>
                Speed boost
              </th>
              <th scope="col" className={headerCellRightAlign}>
                Cache status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.records.length > 0 ? (
              data.records.map((record) => {
                return (
                  <tr key={record.baseUrl} className="w-full py-2 bg-white">
                    <td className={cellLeftAligned}>{record.api}</td>
                    <td className={cellRightAligned}>
                      {(record.hitRate * 100).toFixed(1)}%
                    </td>
                    <td className={cellRightAligned}>
                      {record.hitCount}{" "}
                      {record.hitCount > 0 ? (
                        <ResponseTime time={record.hitP50Time} />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className={cellRightAligned}>
                      {record.missCount}{" "}
                      {record.missCount > 0 ? (
                        <ResponseTime time={record.missP50Time} />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className={cellRightAligned}>
                      {record.hitP50Time > 0 ? (
                        <SpeedBoost
                          hitTime={record.hitP50Time}
                          missTime={record.missP50Time}
                        />
                      ) : (
                        <span className="text-slate-300">–</span>
                      )}
                    </td>
                    <td className={cellRightAligned}>
                      {record.hitCount > 0
                        ? "Cached from headers"
                        : "Nothing caching"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-6 text-sm text-center">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center justify-center p-3 gap-1 bg-yellow-200 border border-yellow-400 rounded-md text-yellow-700">
                      <ExclamationTriangleIcon className="w-4 h-4 " />
                      <span className="text-gray">
                        No API logs found in your current date range
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ResponseTime({ time }: { time: number }) {
  let colorClassname = "text-rose-500";
  if (time <= 200) {
    colorClassname = "text-orange-500";
  }
  if (time <= 100) {
    colorClassname = "text-emerald-500";
  }

  return <span className={colorClassname}>({time.toFixed(0)}ms)</span>;
}

function SpeedBoost({
  hitTime,
  missTime,
}: {
  hitTime: number;
  missTime: number;
}) {
  const speedBoost = missTime / hitTime;
  let colorClassname = "text-slate-500";
  if (speedBoost >= 2) {
    colorClassname = "text-orange-500";
  }
  if (speedBoost >= 5) {
    colorClassname = "text-emerald-500";
  }

  return <span className={colorClassname}>{speedBoost.toFixed(1)}x</span>;
}
