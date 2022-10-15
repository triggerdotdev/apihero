import { ChevronRightIcon, HomeIcon } from "@heroicons/react/solid";
import { NavLink, useMatches } from "@remix-run/react";

export function Breadcrumb() {
  const matches = useMatches();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <NavLink to="/">
            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </NavLink>
        </li>
        {matches
          // skip routes that don't have a breadcrumb
          .filter((match) => match.handle && match.handle.breadcrumbName)
          // render breadcrumbs!
          .map((match, index) => (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRightIcon
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                <NavLink
                  to={match.pathname}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {match.handle ? match.handle.breadcrumbName(match) : match.id}
                </NavLink>
              </div>
            </li>
          ))}
      </ol>
    </nav>
  );
}
