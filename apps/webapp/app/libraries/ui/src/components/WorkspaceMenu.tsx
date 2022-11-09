import { Combobox as HeadlessComboBox } from "@headlessui/react";
import classNames from "classnames";
import {
  StyledInput,
  StyledButton,
  StyledChevron,
  StyledOptions,
  StyledOption,
} from "./ComboBox";
import { useUserWorkspacesData } from "~/routes/__app";
import { CheckIcon } from "@heroicons/react/24/solid";
import {
  BookmarkIcon,
  BriefcaseIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Workspace, Project } from ".prisma/client";
import { useState } from "react";

type WorkspaceMenuProps = {
  workspaces: (Workspace & {
    projects: Project[];
  })[];
  currentProjectSlug?: string;
};

export default function WorkspaceMenu({
  workspaces,
  currentProjectSlug,
}: WorkspaceMenuProps) {
  const [projectSlug, setProjectSlug] = useState(currentProjectSlug);
  return (
    <HeadlessComboBox
      value={projectSlug}
      onChange={(v) => {
        setProjectSlug(v);
        //   if (onChange !== undefined) {
        //     onChange(v);
        //   }
      }}
    >
      <div className="relative">
        <StyledInput
          onChange={(event) => {}}
          displayValue={(selected: string) => selected}
        />
        <StyledButton>
          <StyledChevron />
        </StyledButton>
        <StyledOptions>
          {workspaces.map((workspace) => {
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <BriefcaseIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-semibold text-base">
                    {workspace.title}
                  </span>
                </div>
                {workspace.projects.map((project) => {
                  return (
                    <>
                      <StyledOption key={project.slug} value={project.slug}>
                        {({ active, selected }) => (
                          <>
                            <div
                              className={classNames(
                                "flex items-center ml-1 gap-1.5",
                                selected && "bg-slate-200"
                              )}
                            >
                              <BookmarkIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                              <span className="block truncate">
                                {project.title}
                              </span>
                            </div>

                            {selected && (
                              <span
                                className={classNames(
                                  "absolute inset-y-0 right-0 flex items-center pr-4 bg-slate-200",
                                  active ? "text-blue-500" : "text-blue-500"
                                )}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </>
                        )}
                      </StyledOption>
                      <StyledOption value={project.slug}>
                        <div className="flex gap-2">
                          <PlusIcon
                            className="h-5 w-5 text-green-500"
                            aria-hidden="true"
                          />
                          <span className="">New Project</span>
                        </div>
                      </StyledOption>
                    </>
                  );
                })}
              </>
            );
          })}
        </StyledOptions>
      </div>
    </HeadlessComboBox>
  );
}

/* //Todo use the workspaces from the loader in the new dropdown */

/* <div className="flex flex-shrink flex-grow items-center justify-between bg-slate-50">
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
      </div> */
