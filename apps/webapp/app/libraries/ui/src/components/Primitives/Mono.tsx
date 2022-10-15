export type MonoProps = {
  children: React.ReactNode;
  className: string;
};

export function Mono({ children, className }: MonoProps) {
  return <p className={`font-mono text-base ${className}`}>{children}</p>;
}
