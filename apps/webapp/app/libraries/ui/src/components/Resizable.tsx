import React, { useState, useEffect, useRef, useCallback } from "react";

type ResizableProps = {
  children: React.ReactNode;
  position: "top" | "bottom" | "left" | "right";
  initialSize: number;
  minimumSize: number;
  maximumSize: number;
  className?: string;
};

export default function Resizable({
  children,
  position = "right",
  initialSize,
  minimumSize,
  maximumSize,
  className,
}: ResizableProps) {
  const [dimension, setDimension] = useState(initialSize);
  const previousDragPosition = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>): void => {
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

      let offset = 0;
      switch (position) {
        case "top":
          offset = previousDragPosition.current.y - e.clientY;
          break;
        case "bottom":
          offset = e.clientY - previousDragPosition.current.y;
          break;
        case "left":
          offset = previousDragPosition.current.x - e.clientX;
          break;
        case "right":
          offset = e.clientX - previousDragPosition.current.x;
          break;
      }
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
    [dimension, position, maximumSize, minimumSize]
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

  const style = () => {
    let formatted = dimension + "px";

    if (position === "left" || position === "right") {
      return {
        width: formatted,
      };
    } else {
      return {
        height: formatted,
      };
    }
  };

  let borderClass = "";
  switch (position) {
    case "top":
      borderClass = "border-b";
      break;
    case "bottom":
      borderClass = "border-t";
      break;
    case "left":
      borderClass = "border-r";
      break;
    case "right":
      borderClass = "border-l";
      break;
  }

  return (
    <div
      style={style()}
      className={`relative flex h-full flex-none border-slate-200 ${borderClass} ${className}`}
    >
      <div className={"flex-1"} style={{ width: "inherit" }}>
        {children}
      </div>
      {position === "top" && (
        <div
          className={
            "absolute -bottom-[5px] z-40 my-0 h-1.5 w-full cursor-row-resize transition-all hover:bg-blue-500 hover:opacity-100"
          }
          onMouseDown={handleDragStart}
        ></div>
      )}
      {position === "bottom" && (
        <div
          className={
            "absolute -top-[5px] z-40 my-0 h-1.5 w-full cursor-row-resize transition-all hover:bg-blue-500 hover:opacity-100"
          }
          onMouseDown={handleDragStart}
        ></div>
      )}
      {position === "left" && (
        <div
          className={
            "absolute -right-[5px] z-40 my-0 h-full w-1.5 cursor-col-resize transition-all hover:bg-blue-500 hover:opacity-100"
          }
          onMouseDown={handleDragStart}
        ></div>
      )}
      {position === "right" && (
        <div
          className={
            "absolute -left-[5px] z-40 my-0 h-full w-1.5 cursor-col-resize transition-all hover:bg-blue-500 hover:opacity-100"
          }
          onMouseDown={handleDragStart}
        ></div>
      )}
    </div>
  );
}
