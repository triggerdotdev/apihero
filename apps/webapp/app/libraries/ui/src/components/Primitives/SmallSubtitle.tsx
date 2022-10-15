export type SmallSubtitleProps = {
  children: React.ReactNode;
  className: string;
};

export function SmallSubtitle({ children, className }: SmallSubtitleProps) {
  return <p className={`font-sans text-base ${className}`}>{children}</p>;
}
