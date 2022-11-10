import { Link, useSearchParams } from "@remix-run/react";
import classnames from "classnames";

type SelectedTab = "logs" | "dashboard";

export function LogsTabs({ selected }: { selected: SelectedTab }) {
  const [searchParams] = useSearchParams();

  return (
    <div className={"-mb-px flex space-x-4 border-b border-slate-200"}>
      <Link
        className={tabStyle(selected, "dashboard")}
        to={`../dashboard?${searchParams.toString()}`}
      >
        Dashboard
      </Link>
      <Link
        className={tabStyle(selected, "logs")}
        to={`../logs?${searchParams.toString()}`}
      >
        Logs
      </Link>
    </div>
  );
}

function tabStyle(selected: SelectedTab, tab: SelectedTab) {
  return classnames(
    selected === tab
      ? "border-blue-500 text-slate-900 outline-none"
      : "border-transparent text-slate-800 hover:border-slate-200 hover:text-slate-700",
    "disabled:text-slate-300 disabled:hover:border-transparent",
    "flex whitespace-nowrap border-b-2 py-2 px-4 text-xs font-medium"
  );
}
