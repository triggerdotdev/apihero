import type { LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { generateSpecFromSchema } from "~/models/apiSchema.server";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  invariant(id, "id is required");

  const openApiSchema = await generateSpecFromSchema(id);

  return new Response(JSON.stringify(openApiSchema), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename=${id}.json`,
    },
  });
};
