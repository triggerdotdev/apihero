export type LargeMonoProps = {
  children: React.ReactNode;
  className: string;
};

export function LargeMono({ children, className }: LargeMonoProps) {
  return <p className={`font-mono text-base ${className}`}>{children}</p>;
}
