import { Outlet, useMatches } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import { Footer, Header } from "~/libraries/ui";
import { getWorkspaces } from "~/models/workspace.server";
import { clearRedirectTo, commitSession } from "~/services/redirectTo.server";
import { requireUserId } from "~/services/session.server";

export type LoaderData = UseDataFunctionReturn<typeof loader>;

export function useUserWorkspacesData(): LoaderData {
  const matches = useMatches();

  const appRoute = matches.find((match) => match.id.endsWith("/__app"));

  const appRouteData = appRoute?.data;

  if (!appRouteData) {
    throw new Error("Could not find app route data");
  }

  return appRouteData as LoaderData;
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const workspaces = await getWorkspaces({ userId });

  return typedjson(
    { workspaces },
    {
      headers: {
        "Set-Cookie": await commitSession(await clearRedirectTo(request)),
      },
    }
  );
}

export default function AppLayout() {
  const { workspaces } = useTypedLoaderData<typeof loader>();
  return (
    <div className="flex h-screen flex-col overflow-auto">
      <Header>Workspaces dropdown here</Header>
      {/* //Todo use the workspaces from the loader in the new dropdown */}
      {/* <div className="flex flex-shrink flex-grow items-center justify-between bg-slate-50">
        <div className="flex h-full flex-col justify-between bg-white p-4">
          <ul>
            <li>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                Workspaces
              </p>
            </li>
            {workspaces.map((workspace) => (
              <li className="mb-6" key={workspace.id}>
                <div className="group flex w-full items-center justify-between">
                  <p className="mb-2 text-xl font-semibold">
                    {workspace.title}
                  </p>
                </div>

                <ul className="flex flex-col gap-2">
                  {workspace.projects.map((project) => (
                    <Link
                      to={`/workspaces/${workspace.slug}/projects/${project.slug}`}
                      className="flex w-full flex-grow items-center rounded-md bg-slate-100 transition hover:bg-slate-200"
                      key={project.id}
                    >
                      <li className="group flex w-full items-center justify-between p-3">
                        <div className="flex overflow-hidden text-ellipsis whitespace-nowrap">
                          <BookOpenIcon className="mr-2 flex h-6 w-6 flex-shrink-0 flex-grow-0 text-blue-500" />
                          <p className="text-base text-slate-700">
                            {project.title}
                          </p>
                        </div>
                        <ProjectSettingsMenu projectId={project.id} />
                      </li>
                    </Link>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-5">
            <li className="-mb-1 text-xs font-medium uppercase tracking-widest text-slate-500">
              Help and resources
            </li>
            {helpAndResources.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={helpLinks}
                >
                  {item.icon}
                  <span className={helpLinkSpan}>{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div> */}
      <Outlet />
      <Footer />
    </div>
  );
}
