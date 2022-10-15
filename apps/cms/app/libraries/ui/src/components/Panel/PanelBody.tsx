export type PanelBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export function PanelBody({ children, className }: PanelBodyProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
