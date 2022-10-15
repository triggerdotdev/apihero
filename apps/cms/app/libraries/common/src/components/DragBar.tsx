import classnames from "classnames";

type DragBarProps = {
  id?: string;
  dir?: string;
  isDragging: boolean;
  [key: string]: any;
};

export function DragBar({
  id = "drag-bar",
  dir,
  isDragging,
  ...props
}: DragBarProps) {
  return (
    <div
      id={id}
      data-testid={id}
      className={classnames(
        "flex w-2 flex-shrink-0 cursor-ew-resize bg-gray-200 transition hover:bg-indigo-500",
        dir === "horizontal" && "h-2 w-full cursor-ns-resize transition",
        isDragging && "bg-indigo-500 transition hover:bg-indigo-500"
      )}
      {...props}
    />
  );
}
