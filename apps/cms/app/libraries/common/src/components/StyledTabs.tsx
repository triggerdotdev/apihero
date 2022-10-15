import { Tab as HeadlessTab } from "@headlessui/react";
import classnames from "classnames";

export function ClassicList({ children }: { children: React.ReactNode }) {
  return (
    <HeadlessTab.List className={"-mb-px flex bg-slate-50"}>
      {children}
    </HeadlessTab.List>
  );
}

export function Classic({ children }: { children: React.ReactNode }) {
  return (
    <HeadlessTab
      className={({ selected }) =>
        classnames(
          selected
            ? " border-slate-200 bg-white text-slate-600"
            : "border-b border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-200 hover:text-slate-800",
          "flex whitespace-nowrap border-r py-3 px-3 text-xs focus:outline-none"
        )
      }
    >
      {children}
    </HeadlessTab>
  );
}

export function UnderlinedList({ children }: { children: React.ReactNode }) {
  return (
    <HeadlessTab.List
      className={"-mb-px flex space-x-4 border-b border-slate-200"}
    >
      {children}
    </HeadlessTab.List>
  );
}

type UnderlineProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

export function Underlined({ children, disabled = false }: UnderlineProps) {
  return (
    <HeadlessTab
      className={({ selected }) =>
        classnames(
          selected
            ? "border-blue-500 text-slate-900 outline-none"
            : "border-transparent text-slate-800 hover:border-slate-200 hover:text-slate-700",
          "disabled:text-slate-300 disabled:hover:border-transparent",
          "flex whitespace-nowrap border-b-2 py-2 px-4 text-xs font-medium"
        )
      }
      disabled={disabled}
    >
      {children}
    </HeadlessTab>
  );
}
