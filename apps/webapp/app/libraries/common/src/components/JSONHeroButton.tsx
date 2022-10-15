import { Link } from "@remix-run/react";
import Icon from "../../../../assets/images/apihero-small.png";

export function JSONHeroButton({
  to,
  text = "Open in JSON Hero",
}: {
  to: string;
  text?: string;
}) {
  return (
    <Link
      target="_blank"
      to={to}
      className="flex items-center justify-center rounded border border-slate-200 border-transparent bg-white py-2 pl-2 pr-3 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-100"
    >
      <img src={Icon} alt="JSON Hero icon" className="mr-1 h-5" />
      {text}
    </Link>
  );
}
