import classNames from "classnames";

type SelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

const defaultClasses =
  "mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm";

export function Select({ children, className, ...props }: SelectProps) {
  return (
    <select className={classNames(defaultClasses, className)} {...props}>
      {children}
    </select>
  );
}
