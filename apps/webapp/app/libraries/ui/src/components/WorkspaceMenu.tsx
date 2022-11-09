import { Combobox as HeadlessComboBox } from "@headlessui/react";
import classNames from "classnames";
import {
  StyledInput,
  StyledButton,
  StyledChevron,
  StyledOptions,
  StyledOption,
} from "./ComboBox";
import { CheckIcon } from "@heroicons/react/24/solid";
import {
  BookmarkIcon,
  BriefcaseIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { Workspace, Project } from ".prisma/client";
import React, { useState } from "react";
import { Link } from "@remix-run/react";

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
              <React.Fragment key={workspace.slug}>
                <div className="flex items-center gap-2 mb-2">
                  <BriefcaseIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-semibold text-base text-slate-600">
                    {workspace.title}
                  </span>
                </div>
                {workspace.projects.map((project) => {
                  return (
                    <div key={project.slug} className="flex flex-col gap-1">
                      <StyledOption value={project.slug}>
                        {({ active, selected }) => (
                          <>
                            <div
                              className={classNames(
                                "flex items-center gap-1.5",
                                selected && ""
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
                                  "absolute inset-y-0 right-0 flex items-center pr-4 rounded-r",
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
                      <Link to={`/workspaces/${workspace.slug}/projects/new`}>
                        <div className="flex gap-2 pl-3 py-2 rounded bg-white hover:bg-slate-100 transition">
                          <PlusIcon
                            className="h-5 w-5 text-green-500"
                            aria-hidden="true"
                          />
                          <span className="text-slate-600">New Project</span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </StyledOptions>
      </div>
    </HeadlessComboBox>
  );
}
