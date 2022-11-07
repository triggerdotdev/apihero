import { useUserWorkspacesData } from "~/routes/__app";

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
