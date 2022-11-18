import { Log } from "internal-logs";
import { Client } from "pg";
import { namedParameters } from "./named-sql";

export async function createLogs(logs: Log[]) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  await client.query("BEGIN");
  const promises = logs.map((log) => {
    const logRecord = {
      ...log,
      requestHeaders: JSON.stringify(log.requestHeaders),
      requestBody: JSON.stringify(log.requestBody),
      responseHeaders: JSON.stringify(log.responseHeaders),
      responseBody: JSON.stringify(log.responseBody),
    };
    const namedQuery = namedParameters(
      `INSERT INTO "Log" (id, request_id, project_id, method, status_code, base_url, path, search, request_headers, request_body, response_headers, response_body, is_cache_hit, response_size, request_duration, gateway_duration, environment, time) VALUES (:id, :requestId, :projectId, :method, :statusCode, :baseUrl, :path, :search, :requestHeaders, :requestBody, :responseHeaders, :responseBody, :isCacheHit, :responseSize, :requestDuration, :gatewayDuration, :environment, :time)`,
      logRecord
    );
    return client.query(namedQuery);
  });
  await Promise.all(promises);
  await client.query("COMMIT");
  await client.end();
}

export async function deleteLogsForProject(projectId: string) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  await client.query("BEGIN");
  const namedQuery = namedParameters(
    `DELETE FROM "Log" WHERE project_id = :projectId`,
    { projectId }
  );
  await client.query(namedQuery);
  await client.query("COMMIT");
  await client.end();
}

export async function deleteLogs(ids: string[]) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  await client.query("BEGIN");
  const queryText = `DELETE FROM "Log" WHERE id IN (${ids
    .map((_, i) => `$${i + 1}`)
    .join(", ")})`;
  await client.query(queryText, ids);
  await client.query("COMMIT");
  await client.end();
}
