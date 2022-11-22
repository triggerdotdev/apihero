import type { GetLogsSuccessResponse, GetProjectStats } from "internal-logs";
import { env } from "~/env.server";

export async function searchLogsInProject(
  searchParams: URLSearchParams,
  projectId: string
): Promise<GetLogsSuccessResponse | undefined> {
  const searchObject = Object.fromEntries(searchParams.entries());

  if (searchObject.page === undefined) {
    searchParams.set("page", "1");
  }
  if (searchObject.days === undefined && searchObject.start === undefined) {
    searchParams.set("days", "7");
  }

  const apiUrl = `${
    env.LOGS_ORIGIN
  }/logs/${projectId}?${searchParams.toString()}`;

  const logsResponse = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${env.LOGS_API_AUTHENTICATION_TOKEN}`,
    },
  });

  const json = await logsResponse.json();
  return json;
}

export async function hasLogsInProject(projectId: string): Promise<boolean> {
  const response = await searchLogsInProject(
    new URLSearchParams({ days: "365", page: "1" }),
    projectId
  );

  return typeof response === "undefined" ? false : response.logs.length > 0;
}

export async function getProjectStats(): Promise<GetProjectStats> {
  const apiUrl = `${env.LOGS_ORIGIN}/stats/projects`;

  const logsResponse = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${env.LOGS_API_AUTHENTICATION_TOKEN}`,
    },
  });

  const json = await logsResponse.json();
  return json;
}
