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
    <div className="flex flex-shrink flex-grow items-center justify-between bg-slate-50">
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
            <h3 className="mb-5 text-2xl font-bold text-slate-700 xl:font-medium">
              Get started with API Hero
            </h3>

            <ul className="mb-10 flex flex-col gap-6">
              <li className="flex items-baseline gap-2">
                <p className="text-xl font-bold">1.</p>
                <div>
                  <p className="mb-2">
                    Watch this overview video to get started or check out the
                    documentation{" "}
                    <a
                      href="https://docs.apihero.run"
                      target="_blank"
                      className="underline transition hover:bg-slate-50 hover:text-blue-600"
                      rel="noreferrer"
                    >
                      here
                    </a>
                    .
                  </p>
                  <iframe
                    src="https://www.youtube.com/embed/l2BGiZ4IbRY"
                    title="Get started with API Hero YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                </div>
              </li>
              <li className="flex items-baseline gap-2">
                <p className="text-xl font-bold">2.</p>
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
              <li className="flex items-baseline gap-2">
                <p className="text-xl font-bold">3.</p>
                <p>
                  Call your first API by following the documentation{" "}
                  <a
                    href="https://docs.apihero.run"
                    target="_blank"
                    className="underline transition hover:bg-slate-50 hover:text-blue-600"
                    rel="noreferrer"
                  >
                    here
                  </a>
                  .
                </p>
              </li>
            </ul>
            <hr className="my-8 h-px border-0 bg-slate-300" />
            <h3 className="mb-5 text-2xl font-bold text-slate-700 xl:font-medium">
              Need help?
            </h3>
            <p className="mb-8">
              If you have any questions feel free to schedule a call with one of
              us below, or email us at{" "}
              <a className="underline" href="mailto:hello@apihero.run">
                hello@apihero.run
              </a>
              . We're more than happy to help!
            </p>
            <ul className="flex gap-4">
              <li className={founderAvatars}>
                <a
                  href="https://cal.com/team/apihero/product-feedback"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="rounded-full"
                    src={MattAvatar}
                    alt="Matt Aitken, founder of API Hero"
                  />
                </a>
                <span className="">Matt</span>
              </li>
              <li className={founderAvatars}>
                <a
                  href="https://cal.com/team/apihero/product-feedback"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="rounded-full"
                    src={EricAvatar}
                    alt="Eric Allam, founder of API Hero"
                  />
                </a>
                <span className="">Eric</span>
              </li>
              <li className={founderAvatars}>
                <a
                  href="https://cal.com/team/apihero/product-feedback"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="rounded-full"
                    src={JamesAvatar}
                    alt="James Ritchie, founder of API Hero"
                  />
                </a>
                <span className="">James</span>
              </li>
              <li className={founderAvatars}>
                <a
                  href="https://cal.com/team/apihero/product-feedback"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="rounded-full"
                    src={DanAvatar}
                    alt="Dan Patel, founder of API Hero"
                  />
                </a>
                <span className="">Dan</span>
              </li>
            </ul>
            <a
              href="https://cal.com/team/apihero/product-feedback"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center rounded bg-blue-500 py-3 px-4 text-white transition hover:bg-blue-600"
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-white" />
              Schedule a call
            </a>
          </div>
          <InfoPanel />
        </>
      )}
    </div>
  );
}
