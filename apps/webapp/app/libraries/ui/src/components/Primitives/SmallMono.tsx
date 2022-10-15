export type SmallMonoProps = {
  children: React.ReactNode;
  className: string;
};

export function SmallMono({ children, className }: SmallMonoProps) {
  return <p className={`font-mono text-sm ${className}`}>{children}</p>;
}
