import classNames from "classnames";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const commonButtonClasses =
  "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto";

const primaryClasses =
  "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 border-transparent transition";
export function PrimaryButton({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={classNames(commonButtonClasses, primaryClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}

const secondaryClasses =
  "bg-white text-slate-700 hover:bg-slate-50 focus:ring-indigo-500 border-slate-300 transition";
export function SecondaryButton({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(commonButtonClasses, secondaryClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}

const destructiveClasses =
  "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent transition";
export function DestructiveButton({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(commonButtonClasses, destructiveClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}

const secondaryDestructiveClasses =
  "text-red-500 hover:bg-red-50 border border-red-500 transition";
export function SecondaryDestructiveButton({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        commonButtonClasses,
        secondaryDestructiveClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
