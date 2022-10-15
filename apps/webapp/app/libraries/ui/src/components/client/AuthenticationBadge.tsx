import classNames from "classnames";
import { classNamesForTagName } from "~/components/tags";

type AuthenticationBadgeProps = {
  name: string;
};

export function AuthenticationBadge({ name }: AuthenticationBadgeProps) {
  return (
    <span
      className={classNames(
        classNamesForTagName(name),
        "block whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold"
      )}
    >
      {name}
    </span>
  );
}
