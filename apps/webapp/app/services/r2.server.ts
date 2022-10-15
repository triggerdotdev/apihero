// Create service client module using ES6 syntax.
import { S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

let r2Client: S3Client;

declare global {
  var __r2_client__: S3Client;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  r2Client = getClient();
} else {
  if (!global.__r2_client__) {
    global.__r2_client__ = getClient();
  }
  r2Client = global.__r2_client__;
}

function getClient() {
  const parsedEnv = z
    .object({
      R2_ACCESS_KEY_ID: z.string(),
      R2_SECRET_ACCESS_KEY: z.string(),
      CLOUDFLARE_ACCOUNT_ID: z.string(),
    })
    .safeParse(process.env);

  if (!parsedEnv.success) {
    throw new Error(
      `Missing environment variables: ${parsedEnv.error.message}`
    );
  }

  const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, CLOUDFLARE_ACCOUNT_ID } =
    parsedEnv.data;

  console.log(`🔌 setting up r2 client app`);
  // NOTE: during development if you change anything in this function, remember
  // that this only runs once per server restart and won't automatically be
  // re-run per request like everything else is. So if you need to change
  // something in this file, you'll need to manually restart the server.
  const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  return r2Client;
}

export { r2Client };
