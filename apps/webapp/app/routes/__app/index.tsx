import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteProject } from "~/models/project.server";
import { requireUserId } from "~/services/session.server";
import MattAvatar from "~/assets/images/founders/matt.jpg";
import EricAvatar from "~/assets/images/founders/eric.jpg";
import JamesAvatar from "~/assets/images/founders/james.jpg";
import DanAvatar from "~/assets/images/founders/dan.jpg";
import { CalendarIcon } from "@heroicons/react/24/solid";
import { CopyTextButton } from "~/libraries/ui/src/components/CopyTextButton";
import { InfoPanel } from "~/libraries/ui/src/components/InfoPanel";
import { useUserWorkspacesData } from "~/routes/__app";

const founderAvatars =
  "rounded-full flex flex-col h-20 w-20 bg-slate-100 flex items-center justify-center text-slate-800";

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
  return (
    <div className="flex h-full flex-grow items-center justify-between bg-slate-50">
      <WorkspaceBlankStateGettingStarted />
    </div>
  );
}

function WorkspaceBlankStateGettingStarted() {
  const { workspaces } = useUserWorkspacesData();
  const hasProjects = workspaces.some((workspace) => workspace.projects.length);

  return (
    <div className="h-full w-full max-w-2xl flex-col justify-between xl:flex xl:max-w-none xl:flex-row">
      {hasProjects ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-slate-700">Select a project from the menu.</p>
        </div>
      ) : (
        <>
          <div className="max-w-3xl p-6">
            <h3 className="mb-5 text-3xl font-bold text-slate-700 xl:font-medium">
              Get started with API Hero
            </h3>
            <p className="text-xl">
              Connect to 3rd party APIs in seconds,
              <span className="font-bold"> directly from your frontend. </span>
            </p>

            <ul className="mb-10 mt-4 flex flex-col gap-6">
              <li className="flex items-baseline gap-2">
                <div className="flex flex-col">
                  <p className="flex flex-col mb-2 gap-4">
                    In either a new or existing project, follow our guides below
                    to add API Hero using the API Hero CLI.
                    <a
                      href="https://docs.apihero.run/react-quick-start"
                      target="_blank"
                      className="underline transition hover:bg-slate-50 hover:text-blue-600"
                      rel="noreferrer"
                    >
                      Get started with React
                    </a>
                    <a
                      href="https://docs.apihero.run/node-quick-start"
                      target="_blank"
                      className="underline transition hover:bg-slate-50 hover:text-blue-600"
                      rel="noreferrer"
                    >
                      Get started with Node
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-baseline gap-2">
                <p className="text-xl font-bold">OR</p>
                <div className="flex w-full flex-col gap-2">
                  <p>Install API Hero and either the Github or Twitter APIs</p>
                  <pre className="flex w-full items-center justify-between gap-4 rounded bg-slate-200 px-4 py-3 text-xs xl:text-base">
                    npx apihero@latest add Github
                    <CopyTextButton value={"npx apihero@latest add GitHub"} />
                  </pre>
                  <pre className="flex w-full items-center justify-between gap-4 rounded bg-slate-200 px-4 py-3 text-xs xl:text-base">
                    npx apihero@latest add Twitter
                    <CopyTextButton value={"npx apihero@latest add Twitter"} />
                  </pre>
                </div>
              </li>

              <p className="pt-8">
                Once API Hero is setup correctly you will have a new API Hero
                project and can monitor your API traffic via this web app.
              </p>
            </ul>
          </div>
          <InfoPanel />
        </>
      )}
    </div>
  );
}
