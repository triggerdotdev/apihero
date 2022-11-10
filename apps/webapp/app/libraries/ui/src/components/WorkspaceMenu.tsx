import { Popover, Transition } from "@headlessui/react";
import classNames from "classnames";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import {
  BookmarkIcon,
  BriefcaseIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { Workspace, Project } from ".prisma/client";
import React, { Fragment, useState } from "react";
import { Link } from "@remix-run/react";
import { useCurrentProjectSlug } from "~/libraries/common/src/hooks/useCurrentProject";

type WorkspaceMenuProps = {
  workspaces: (Workspace & {
    projects: Project[];
  })[];
};

export default function WorkspaceMenu({ workspaces }: WorkspaceMenuProps) {
  const currentProjectSlug = useCurrentProjectSlug();

  const currentProject = workspaces
    .flatMap((w) => w.projects)
    .find((p) => p.slug === currentProjectSlug);

  return (
    <div className="w-full max-w-max px-4">
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={`
                ${open ? "" : "text-opacity-90"}
                group inline-flex items-center rounded text-slate-700 hover:text-blue-600 bg-white pl-2.5 pr-2 py-1 text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition focus:outline-none`}
            >
              <span className="transition">{currentProject?.title}</span>
              <ChevronDownIcon
                className={`${open ? "rotate-180" : "text-opacity-70"}
                  ml-1 h-5 w-5 transition duration-150 ease-in-out group-hover:text-opacity-80`}
                aria-hidden="true"
              />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen min-w-max max-w-xs -translate-x-1/2 transform px-4 sm:px-0">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid py-1 bg-white grid-cols-1">
                    {workspaces.map((workspace) => {
                      return (
                        <React.Fragment key={workspace.slug}>
                          <div className="flex items-center gap-2 ml-2 mt-1 mb-2 py-0.5">
                            <BriefcaseIcon className="h-5 w-5 text-slate-600" />
                            <span className="font-semibold text-base text-slate-600">
                              {workspace.title}
                            </span>
                          </div>
                          {workspace.projects.map((project) => {
                            return (
                              <div
                                key={project.slug}
                                className="flex flex-col gap-1"
                              >
                                <Link
                                  to={`/workspaces/${workspace.slug}/projects/${project.slug}/home`}
                                  className={classNames(
                                    "flex items-center justify-between gap-1.5 mx-1 px-3 py-2 text-slate-600 rounded hover:bg-slate-100 transition",
                                    project.slug === currentProjectSlug &&
                                      "!bg-slate-200"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <BookmarkIcon
                                      className="h-5 w-5 z-100"
                                      aria-hidden="true"
                                    />
                                    <span className="block truncate">
                                      {project.title}
                                    </span>
                                  </div>
                                  {project.slug === currentProjectSlug && (
                                    <CheckIcon className="h-5 w-5 text-blue-500" />
                                  )}
                                </Link>

                                <Link
                                  to={`/workspaces/${workspace.slug}/projects/new`}
                                >
                                  <div className="flex items-center gap-2 mx-1 pl-3 py-2 rounded bg-white hover:bg-slate-100 transition">
                                    <PlusIcon
                                      className="h-5 w-5 text-green-500"
                                      aria-hidden="true"
                                    />
                                    <span className="text-slate-600">
                                      New Project
                                    </span>
                                  </div>
                                </Link>
                                <div className="border-t w-full border-slate-100" />
                              </div>
                            );
                          })}
                          <Link to={`/workspaces/new`}>
                            <div className="flex items-center gap-2 mx-1 mt-1 pl-1 py-2 rounded bg-white hover:bg-slate-100 transition">
                              <PlusIcon
                                className="h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                              <span className="text-slate-600">
                                New Workspace
                              </span>
                            </div>
                          </Link>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}
