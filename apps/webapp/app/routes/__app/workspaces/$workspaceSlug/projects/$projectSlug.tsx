import {
  BoltIcon,
  FireIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { NavLink, Outlet } from "@remix-run/react";

const defaultStyle =
  "flex gap-y-2 h-20 w-20 flex-col items-center text-sm rounded py-3 px-4 text-slate-700 transition hover:bg-slate-50";

const activeStyle =
  "flex gap-y-2 h-20 w-20 flex-col items-center text-sm rounded py-3 px-4 text-slate-700 bg-slate-100";

export default function ProjectMenu() {
  return (
    <>
      <div className="flex h-mainMobileContainerHeight md:h-mainDesktopContainerHeight">
        <nav className="flex flex-col justify-between border-r border-slate-200 h-full bg-white p-2">
          <ul className="flex flex-col gap-2">
            <li>
              <NavLink
                to="home"
                className={({ isActive }) =>
                  isActive ? activeStyle : defaultStyle
                }
              >
                <RectangleGroupIcon className="h-10 w-10" />
                <span className="">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="caching"
                className={({ isActive }) =>
                  isActive ? activeStyle : defaultStyle
                }
              >
                <BoltIcon className="h-10 w-10" />
                <span className="">Caching</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="alerts"
                className={({ isActive }) =>
                  isActive ? activeStyle : defaultStyle
                }
              >
                <FireIcon className="h-10 w-10" />
                <span className="">Alerts</span>
              </NavLink>
            </li>
          </ul>
          <ul>
            <li>
              {/* <NavLink
                to="settings"
                className={({ isActive }) =>
                  isActive ? activeStyle : defaultStyle
                }
              >
                <Cog8ToothIcon className="h-10 w-10" />
                <span className="">Settings</span>
              </NavLink> */}
            </li>
          </ul>
        </nav>
        <Outlet />
      </div>
    </>
  );
}
