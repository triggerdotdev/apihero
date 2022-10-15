import { Outlet } from "@remix-run/react";

export default function ModelsLayoutRoute() {
  return (
    <div className="max-w-7xl">
      <Outlet />
    </div>
  );
}
