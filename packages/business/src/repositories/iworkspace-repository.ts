import { HttpClient, Project, User, Workspace } from "../shared/types";

export interface WorkspaceRepository {
  getWorkspace({
    userId,
    id,
  }: Pick<Workspace, "id"> & {
    userId: User["id"];
  }): Promise<Workspace | null>;

  getWorkspaceFromSlug({
    userId,
    slug,
  }: Pick<Workspace, "slug"> & {
    userId: User["id"];
  }): Promise<Workspace | null>;

  getWorkspaceForProjectId({
    userId,
    projectId,
  }: {
    userId: User["id"];
    projectId: Project["id"];
  }): Promise<Workspace | null>;

  getWorkspaces({ userId }: { userId: User["id"] }): Promise<
    (Workspace & {
      projects: (Project & {
        httpClients: HttpClient[];
      })[];
    })[]
  >;
}
