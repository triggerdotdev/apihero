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
        <div>
          <OnboardingStep2 />
          <p>Main dashboard</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

function OnboardingStep1() {
  return (
    <div className="h-full w-full max-w-2xl flex-col justify-between xl:flex xl:max-w-none xl:flex-row">
      <p className="text-slate-700">
        Onboarding step 1 - shows Getting Started panel and fake low opacity
        dashboard
      </p>
    </div>
  );
}

function OnboardingStep2() {
  return (
    <div className="h-full w-full max-w-2xl flex-col justify-between xl:flex xl:max-w-none xl:flex-row">
      <p className="text-slate-700">
        Onboarding step 2 – just the Getting Started panel with 2 ticked off
        items
      </p>
    </div>
  );
}
