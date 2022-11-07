import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteProject } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";
import { useUserWorkspacesData } from "~/routes/__app";

export async function action({ request }: ActionArgs) {
  if (request.method != "DELETE") {
    return { status: 405 };
  }

  const userId = await requireUserId(request);
  invariant(userId, "userId is required");
  const projectId = (await request.formData()).get("projectId");
  invariant(projectId, "projectId is required");

  if (typeof projectId !== "string") {
    return { status: 400 };
  }

  try {
    await deleteProject({ id: projectId, userId });
    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: error });
  }
}

export default function IndexRoute() {
  const { workspaces } = useUserWorkspacesData();
  const hasProjects = workspaces.some((workspace) => workspace.projects.length);

  return (
    <div className="flex flex-shrink flex-grow items-center justify-between bg-slate-50">
      {hasProjects ? (
        <div className="flex h-full w-full">App route with project</div>
      ) : (
        <>App route without project</>
      )}
    </div>
  );
}
