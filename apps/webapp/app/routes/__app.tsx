import { Outlet, useMatches } from "@remix-run/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import type { UseDataFunctionReturn } from "remix-typedjson/dist/remix";
import { Footer, Header } from "~/libraries/ui";
import WorkspaceMenu from "~/libraries/ui/src/components/WorkspaceMenu";
import { getWorkspaces } from "~/models/workspace.server";
import { clearRedirectTo, commitSession } from "~/services/redirectTo.server";
import { requireUserId } from "~/services/session.server";

export type LoaderData = UseDataFunctionReturn<typeof loader>;

export const meta: MetaFunction = () => ({
  title: "API Hero",
  description:
    "Make every API you use faster and more reliable with one line of code.",
});

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
      <Header>
        <WorkspaceMenu workspaces={workspaces} />
      </Header>
      <Outlet />
      <Footer />
    </div>
  );
}
