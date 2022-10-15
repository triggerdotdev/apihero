export type SwitchPanelIconTopProps = {
  className?: string;
};

export function SwitchPanelIconTop({ className }: SwitchPanelIconTopProps) {
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
        d="M19 16L19 4C19 2.34315 17.6569 1 16 1L4 0.999999C2.34315 0.999999 1 2.34314 1 4L0.999999 16C0.999999 17.6569 2.34315 19 4 19L16 19C17.6569 19 19 17.6569 19 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M2 7L2 4C2 2.89543 2.89543 2 4 2L16 2C17.1046 2 18 2.89543 18 4L18 7L2 7Z"
        fill="#3B82F6"
      />
    </svg>
  );
}
