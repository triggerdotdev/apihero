export type MediumBodyProps = {
  children: React.ReactNode;
  className: string;
};

export function MediumBody({ children, className }: MediumBodyProps) {
  return (
    <p className={`font-sans text-base font-medium ${className}`}>{children}</p>
  );
}
