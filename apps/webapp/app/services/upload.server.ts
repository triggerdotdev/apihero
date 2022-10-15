import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "~/services/r2.server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";

export async function uploadFile(
  key: string,
  contentType: string,
  file: AsyncIterable<Uint8Array>
) {
  const buffer = await convertAsyncIterableToBuffer(file);

  const command = new PutObjectCommand({
    Bucket: "api-hero-uploads",
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  return r2Client.send(command);
}

export async function getSignedGetUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: "api-hero-uploads",
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 60 * 60 });
}

async function convertAsyncIterableToBuffer(
  iterable: AsyncIterable<Uint8Array>
) {
  const chunks = [];
  for await (const chunk of iterable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function createUploadHandler(prefix: string, fieldName: string) {
  return unstable_composeUploadHandlers(async (file) => {
    if (file.name !== fieldName || !file.filename) {
      return undefined;
    }

    const key = `${prefix}/${file.filename}`;

    await uploadFile(key, file.contentType, file.data);

    return key;
  }, unstable_createMemoryUploadHandler({ maxPartSize: 100 * 1024 * 1024 }));
}
