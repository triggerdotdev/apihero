import { Client } from "pg";
import { writeDatabaseConnectionString } from "../app";

export async function deleteLogs(ids: string[]) {
  const client = new Client({
    connectionString: writeDatabaseConnectionString(),
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
