import type { LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { findSchemaById } from "~/models/apiSchema.server";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  invariant(id, "id is required");

  const schema = await findSchemaById(id);

  return new Response(JSON.stringify(schema?.rawData), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename=${id}-original.json`,
    },
  });
};
