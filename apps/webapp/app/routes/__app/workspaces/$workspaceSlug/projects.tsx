import { RectangleGroupIcon } from "@heroicons/react/24/outline";
import { Outlet } from "@remix-run/react";

export default function ProjectMenu() {
  return (
    <div className="flex h-full">
      <nav className="flex flex-col justify-between border-r border-slate-200 h-full bg-white p-2">
        <ul className="flex flex-col">
          <li>
            <a
              href="https://cal.com/team/apihero/product-feedback"
              rel="noreferrer"
              className="flex gap-y-2 h-20 w-20 flex-col items-center whitespace-nowrap rounded bg-slate-100 py-3 px-4 text-slate-700 transition"
            >
              <RectangleGroupIcon className="h-10 w-10" />
              <span className="">Home</span>
            </a>
          </li>
          <li>Caching</li>
          <li>Alerts</li>
        </ul>
        <ul>
          <li>Settings</li>
        </ul>
      </nav>
      <div className="flex flex-grow h-full">
        <Outlet />
      </div>
    </div>
  );
}
