import classNames from "classnames";
import { SmallTitle } from "../Primitives/SmallTitle";

export type PanelHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function PanelHeader({ children, className }: PanelHeaderProps) {
  return (
    <SmallTitle className={classNames("px-4 pt-4", className)}>{children}</SmallTitle>
  );
}
