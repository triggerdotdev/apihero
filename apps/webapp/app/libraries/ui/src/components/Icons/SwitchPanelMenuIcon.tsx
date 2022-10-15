export type SwitchPanelIconProps = {
  className?: string;
};

export function SwitchPanelMenuIcon({ className }: SwitchPanelIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
    >
      <path
        d="M16 1H4C2.34315 1 1 2.34315 1 4V16C1 17.6569 2.34315 19 4 19H16C17.6569 19 19 17.6569 19 16V4C19 2.34315 17.6569 1 16 1Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="2"
        y1="12"
        x2="13"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="12"
        y1="18"
        x2="12"
        y2="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
