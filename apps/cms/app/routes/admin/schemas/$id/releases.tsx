import { Outlet } from "@remix-run/react";

export default function ReleasesLayoutRoute() {
  return (
    <div className="max-w-7xl">
      <Outlet />
    </div>
  );
}
