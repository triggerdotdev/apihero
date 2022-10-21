import { Menu, Transition } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { Form } from "@remix-run/react";

export type ProjectSettingsMenuProps = {
  projectId: string;
};

export function ProjectSettingsMenu({ projectId }: ProjectSettingsMenuProps) {
  return (
    <Menu as="div" className="relative z-50 ml-1">
      <div>
        <Menu.Button className="transitions group flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-300">
          <span className="sr-only">Open project settings menu</span>
          <EllipsisVerticalIcon className="h-5 w-5 text-slate-400 transition group-hover:text-slate-800" />
        </Menu.Button>
      </div>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <>
            {/* //TODO Rename project functionality to add here */}
            {/* <Menu.Item>
              {({ active }) => (
                <a
                  href={item.href}
                  className={classnames(
                    active ? `${item.style}` : "",
                    "mx-2 flex items-center gap-2 rounded-md p-2 pl-3 text-sm text-slate-700"
                  )}
                >
                  {item.icon}
                  {item.name}
                </a>
              )}
            </Menu.Item> */}
            <Menu.Item>
              {({ active }) => (
                <Form method="delete">
                  <input type="hidden" name="projectId" value={projectId} />

                  <button
                    type="submit"
                    name="delete"
                    className="group flex w-full items-center gap-2 rounded-md bg-white p-2 text-slate-700 transition hover:bg-rose-100 hover:text-rose-700"
                    onClick={(event) => {
                      !confirm(
                        "Are you sure you want to delete this project? It will be deleted for all users and all the associated request logs will be deleted. This is permanent."
                      ) && event.preventDefault();
                    }}
                  >
                    <TrashIcon className="h-4 w-4 transition" />
                    <span className="text-sm transition">Delete project</span>
                  </button>
                </Form>
              )}
            </Menu.Item>
          </>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
