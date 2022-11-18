import classNames from "classnames";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";

type ResizableProps = {
  children: React.ReactNode;
  initialSize: number;
  minimumSize: number;
  maximumSize: number;
  className?: string;
};

type ResizableContextType = {
  dimension: number;
  handleDragStart: (e: React.MouseEvent<HTMLElement>) => void;
};

const ResizableContext = createContext<ResizableContextType>({
  dimension: 400,
  handleDragStart: () => {},
});

export default function Resizable({
  children,
  initialSize,
  minimumSize,
  maximumSize,
  className,
}: ResizableProps) {
  const [dimension, setDimension] = useState(initialSize);
  const previousDragPosition = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: React.MouseEvent<HTMLElement>): void => {
    previousDragPosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (previousDragPosition.current == null) {
        return;
      }

      e.preventDefault();

      const offset = e.clientX - previousDragPosition.current.x;
      let newValue = dimension - offset;
      if (minimumSize != null) {
        newValue = Math.max(minimumSize, newValue);
      }
      if (maximumSize != null) {
        newValue = Math.min(maximumSize, newValue);
      }
      setDimension(newValue);
      previousDragPosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    [dimension, maximumSize, minimumSize]
  );

  const handleDragEnd = useCallback(() => {
    previousDragPosition.current = null;
  }, [previousDragPosition]);

  useEffect(() => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);

  return (
    <ResizableContext.Provider value={{ dimension, handleDragStart }}>
      <div
        className={classNames("grid grid-cols-[1fr_200px]", className)}
        style={{ gridTemplateColumns: `1fr ${dimension}px` }}
      >
        {children}
      </div>
    </ResizableContext.Provider>
  );
}

export function ResizableChild({
  children,
  showHandle = false,
  className,
}: {
  children: React.ReactNode;
  showHandle?: boolean;
  className?: string;
}) {
  const { handleDragStart } = useContext(ResizableContext);

  if (!showHandle) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={classNames(
        `relative h-full flex-none border-slate-200 border-l`,
        className
      )}
    >
      <div className="h-full" style={{ width: "inherit" }}>
        {children}
      </div>
      <div
        className={
          "absolute left-0 top-0 z-40 my-0 h-full w-1.5 cursor-col-resize transition hover:bg-blue-500 hover:opacity-100"
        }
        onMouseDown={handleDragStart}
      ></div>
    </div>
  );
}
