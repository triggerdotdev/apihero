import classnames from "classnames";
import { DragBar } from "~/libraries/common";
import { useResizable } from "react-resizable-layout";

type TwoColumnProps = {
  children: React.ReactNode;
};

export function Container({ children }: TwoColumnProps): JSX.Element {
  return (
    <div className="flex h-editEndpointContainerHeight">
      <div className="flex h-full grow overflow-hidden">{children}</div>
    </div>
  );
}

export function Left({ children }: TwoColumnProps) {
  return (
    <div className="flex grow flex-col overflow-y-auto bg-gray-200 pl-2 pb-2 pt-2">
      {children}
    </div>
  );
}

export function Right({ children }: TwoColumnProps) {
  const {
    isDragging: isPluginDragging,
    position: pluginW,
    splitterProps: pluginDragBarProps,
  } = useResizable({
    axis: "x",
    initial: 500,
    min: 200,
    max: 1000,
    reverse: true,
  });
  return (
    <>
      <DragBar isDragging={isPluginDragging} {...pluginDragBarProps} />
      <div
        className={classnames(
          "shrink-0 overflow-y-auto",
          isPluginDragging && "dragging"
        )}
        style={{ width: pluginW }}
      >
        {children}
      </div>
    </>
  );
}
