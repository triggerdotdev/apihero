import { useEffect, useRef, useState } from "react";

export type PanelPosition = "top" | "bottom" | "left" | "right";

type PanelPositionProps = {
  defaultPosition: PanelPosition;
  key: string;
};

type PanelPositionReturn = [PanelPosition, (position: PanelPosition) => void];

export function usePanelPosition({
  defaultPosition,
  key,
}: PanelPositionProps): PanelPositionReturn {
  const [position, setPosition] = useState(defaultPosition);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      return;
    }

    localStorage.setItem(key, position);
  }, [key, position]);

  useEffect(() => {
    hasLoaded.current = true;
    const storedPosition = localStorage.getItem(key);
    if (storedPosition) {
      setPosition(storedPosition as PanelPosition);
    }
  }, [key]);

  return [position, setPosition];
}
