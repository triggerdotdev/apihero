import { Breadcrumb } from "./Breadcrumb";

export function NavBar() {
  return (
    <div className="flex h-10 w-full items-center gap-4 border-b border-gray-100 px-2">
      <Breadcrumb />
    </div>
  );
}
