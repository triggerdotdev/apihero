import { Menu, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import classnames from "classnames";

const filterMenuItems = [
  { name: "Status", href: "#" },
  { name: "{org}", href: "#" },
  { name: "{repo}", href: "#" },
  { name: "Cached", href: "#" },
  { name: "Latency", href: "#" },
  { name: "Size", href: "#" },
];

export function FilterMenu() {
  return (
    <Menu as="div" className="relative z-50">
      <div>
        <Menu.Button className="flex h-[30px] w-[30px] max-w-xs items-center justify-center rounded-md border border-transparent bg-transparent text-sm transition hover:border-slate-200 hover:bg-white">
          <PlusIcon className="h-4 w-4 text-slate-500 hover:text-slate-600" />
          <span className="sr-only">Open filter menu</span>
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
        <Menu.Items className="absolute left-0 mt-1 w-48 origin-top-left rounded-md bg-white pb-2 pt-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <p className="mb-2 border-b border-slate-200 py-2 px-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Add filter
          </p>
          {filterMenuItems.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <a
                  href={item.href}
                  className={classnames(
                    active ? "bg-slate-100" : "",
                    "mx-2 block rounded-md px-3 py-2 text-sm text-slate-700"
                  )}
                >
                  {item.name}
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
