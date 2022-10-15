import { Form } from "@remix-run/react";
import { ActionArgs } from "@remix-run/server-runtime";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { z } from "zod";
import { SecondaryButton } from "~/libraries/common";
import { sorted } from "~/libraries/common/src/multi-sort";
import { adminGetUsers } from "~/models/admin.server";
import { syncIntegrationsSettingsWithGateway } from "~/models/gateway.server";
import { getHttpClientFromIntegrationSlug } from "~/models/httpClient.server";
import { getProject, getProjectFromSlugs } from "~/models/project.server";
import { getWorkspacesWithProjects } from "~/models/workspace.server";

export async function loader() {
  const dbUsers = await adminGetUsers();

  const users = dbUsers.map((user) => {
    let projectsCount = 0;
    let endpointsCount = 0;
    let requestsCount = 0;
    for (
      let workspaceIndex = 0;
      workspaceIndex < user.workspaces.length;
      workspaceIndex++
    ) {
      const workspace = user.workspaces[workspaceIndex];
      projectsCount += workspace.projects.length;

      for (
        let projectIndex = 0;
        projectIndex < workspace.projects.length;
        projectIndex++
      ) {
        const project = workspace.projects[projectIndex];

        for (
          let clientIndex = 0;
          clientIndex < project.httpClients.length;
          clientIndex++
        ) {
          const client = project.httpClients[clientIndex];
          endpointsCount += client.endpoints.length;

          for (
            let endpointIndex = 0;
            endpointIndex < client.endpoints.length;
            endpointIndex++
          ) {
            const endpoint = client.endpoints[endpointIndex];
            requestsCount += endpoint._count.requestLogs;
          }
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      displayName: user.displayName,
      workspacesCount: user.workspaces.length,
      projectsCount: projectsCount,
      endpointsCount: endpointsCount,
      requestsCount: requestsCount,
      admin: user.admin,
    };
  });

  const sortedUsers = sorted(users, [
    { key: "workspacesCount", direction: "desc" },
    { key: "requestsCount", direction: "desc" },
  ]);

  return typedjson({ users: sortedUsers });
}

export async function action({ request }: ActionArgs) {
  if (request.method != "POST") {
    return { status: 405 };
  }

  const formPayload = Object.fromEntries(await request.formData());

  const { userId, perform } = z
    .object({ userId: z.string(), perform: z.string() })
    .parse(formPayload);

  if (perform === "sync") {
    const projectWorkspaces = await getWorkspacesWithProjects({ userId });

    const projects = projectWorkspaces.flatMap((workspace) =>
      workspace.projects.map((project) => ({
        projectSlug: project.slug,
        workspaceSlug: workspace.slug,
      }))
    );

    for (const project of projects) {
      const fullProject = await getProjectFromSlugs({
        workspaceSlug: project.workspaceSlug,
        slug: project.projectSlug,
      });

      if (fullProject == null) continue;

      for (const client of fullProject.httpClients) {
        await syncIntegrationsSettingsWithGateway({
          workspaceSlug: project.workspaceSlug,
          projectSlug: project.projectSlug,
          clientId: client.id,
        });
      }
    }

    return { success: true };
  }
}

const headerClassName =
  "py-3 px-2 pr-3 text-xs font-semibold leading-tight text-slate-900 text-left";
const cellClassName = "whitespace-nowrap px-2 py-2 text-xs text-slate-500";

export default function AdminDashboardRoute() {
  const { users } = useTypedLoaderData<typeof loader>();

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Primary column */}
      <section
        aria-labelledby="primary-heading"
        className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto p-4 lg:order-last"
      >
        <h1 className="mb-2 text-2xl">Accounts ({users.length})</h1>

        <table className="w-full divide-y divide-slate-300">
          <thead className="sticky top-0 bg-white text-left outline outline-2 outline-slate-200">
            <tr>
              <th scope="col" className={headerClassName}>
                Email
              </th>
              <th scope="col" className={headerClassName}>
                GitHub username
              </th>
              <th scope="col" className={headerClassName}>
                Workspaces
              </th>
              <th scope="col" className={headerClassName}>
                Projects
              </th>
              <th scope="col" className={headerClassName}>
                Endpoints
              </th>
              <th scope="col" className={headerClassName}>
                Requests
              </th>
              <th scope="col" className={headerClassName}>
                id
              </th>
              <th scope="col" className={headerClassName}>
                Admin?
              </th>
              <th scope="col" className={headerClassName}>
                Sync with gateway
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => {
              return (
                <tr
                  key={user.id}
                  className="w-full bg-white px-4 py-2 text-left hover:bg-slate-50"
                >
                  <td className={cellClassName}>{user.email}</td>
                  <td className={cellClassName}>
                    <a
                      href={`https://github.com/${user.displayName}`}
                      target="_blank"
                      className="text-indigo-500 underline"
                      rel="noreferrer"
                    >
                      {user.displayName}
                    </a>
                  </td>
                  <td className={cellClassName}>{user.workspacesCount}</td>
                  <td className={cellClassName}>{user.projectsCount}</td>
                  <td className={cellClassName}>{user.endpointsCount}</td>
                  <td className={cellClassName}>{user.requestsCount}</td>
                  <td className={cellClassName}>{user.id}</td>
                  <td className={cellClassName}>{user.admin ? "✅" : ""}</td>
                  <td>
                    <Form method="post">
                      <input type="hidden" name="userId" value={user.id} />
                      <SecondaryButton
                        type="submit"
                        name="perform"
                        value="sync"
                      >
                        Sync
                      </SecondaryButton>
                    </Form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Secondary column (hidden on smaller screens) */}
      <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
        <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white"></div>
      </aside>
    </main>
  );
}
