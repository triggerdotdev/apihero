export type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <div className={`rounded-lg bg-white shadow ${className}`}>
      {children}
    </div>
  );
}
