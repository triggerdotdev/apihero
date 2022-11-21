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
