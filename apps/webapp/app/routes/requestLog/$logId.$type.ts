import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "remix-typedjson";
import invariant from "tiny-invariant";
import { isJson } from "~/libraries/common/src/utilities/prisma-utilities";
import { getLog } from "~/models/requestLog.server";
import { requireUserId } from "~/services/session.server";

const baseURI = "https://jsonhero.io";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { logId, type } = params;
  invariant(logId, "logId is required");
  invariant(type, "type is required");

  const userId = await requireUserId(request);
  if (userId === null) {
    return json({}, { status: 401 });
  }

  if (request.method !== "GET") {
    return json({}, { status: 405 });
  }

  const log = await getLog(logId);
  if (log == null) {
    return json({}, { status: 404 });
  }

  const body = type === "responseBody" ? log.responseBody : log.requestBody;

  if (!isJson(body)) {
    return json({}, { status: 404 });
  }

  const options = {
    method: "POST",
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: logId,
      content: body,
    }),
  };

  try {
    const response = await fetch(
      `${baseURI}/api/create.json?utm_source=vscode`,
      options
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const { location } = await response.json();
    return redirect(location);
  } catch (error) {
    console.error(error);
    return json({}, { status: 500 });
  }
};
