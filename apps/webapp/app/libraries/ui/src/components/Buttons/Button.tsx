import classNames from "classnames";

const baseStyles = {
  solid:
    "group inline-flex gap-2 items-center justify-center rounded py-2 px-4 text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  outline:
    "group inline-flex gap-2 ring-1 items-center justify-center rounded py-2 px-4 text-sm focus:outline-none",
};

const variantStyles: {
  solid: Record<string, string>;
  outline: Record<string, string>;
} = {
  solid: {
    slate:
      "bg-slate-600 transition text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900",
    blue: "bg-blue-500 transition text-white hover:text-slate-100 hover:bg-blue-600 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600",
    white:
      "bg-white text-slate-900 transition hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white",
  },
  outline: {
    slate:
      "ring-slate-200 text-slate-600 transition hover:text-slate-700 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300",
    white:
      "ring-slate-700 text-white transition hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white",
  },
};

export type ButtonProps = {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  variant?: "solid" | "outline";
  color: "slate" | "blue" | "white";
  type?: string;
  target?: "_blank" | "_self" | "_parent" | "_top" | "framename";
  id?: string;
  onClick?: () => void;
} & Record<string, any>;

export function Button({
  variant = "solid",
  color = "blue",
  className,
  href,
  children,
  type,
  target,
  id,
  onClick,
  ...props
}: ButtonProps) {
  const classes = classNames(
    baseStyles[variant],
    variantStyles[variant][color],
    className
  );

  return href ? (
    <a href={href} target={target} className={classes} onClick={onClick}>
      {children}
    </a>
  ) : (
    <button className={classes} onClick={onClick} {...props} />
  );
}
