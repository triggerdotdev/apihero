import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useCallback, useEffect, useState } from "react";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

type PaginationButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function NextButton({ onClick, disabled }: PaginationButtonProps) {
  return (
    <PaginationButton
      onClick={onClick}
      disabled={disabled}
      className="rounded-r-md"
    >
      Next
      <ChevronRightIcon className="h-4 w-4" />
    </PaginationButton>
  );
}

export function PreviousButton({ onClick, disabled }: PaginationButtonProps) {
  return (
    <PaginationButton
      onClick={onClick}
      disabled={disabled}
      className="rounded-l-md"
    >
      <ChevronLeftIcon className="h-4 w-4" />
      Prev
    </PaginationButton>
  );
}

type RefreshButtonProps = PaginationButtonProps & {
  lastUpdated: Date;
};

export function RefreshButton({
  onClick,
  disabled,
  lastUpdated,
}: RefreshButtonProps) {
  const defaultText = "Just now";
  const [timeSince, setTimeSince] = useState(defaultText);

  const refreshTime = useCallback(() => {
    setTimeSince(timeAgo.format(lastUpdated, "round"));
  }, [lastUpdated]);

  useEffect(() => {
    const interval = setInterval(() => refreshTime(), 1000);
    return () => clearInterval(interval);
  }, [refreshTime]);

  return (
    <div className="flex items-center">
      <span className="text-xs text-slate-500">{timeSince}</span>
      <PaginationButton
        className="ml-2"
        onClick={() => {
          setTimeSince(defaultText);
          onClick();
        }}
        disabled={disabled}
      >
        <ArrowPathIcon className="mr-1 h-4 w-4" />
        Refresh
      </PaginationButton>
    </div>
  );
}

function PaginationButton({
  onClick,
  disabled = false,
  children,
  className,
}: {
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`focus:shadow-outline group flex h-[30px] max-w-xs items-center justify-center rounded-md border border-transparent bg-transparent p-3 py-2 text-xs text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-800 focus:outline-none disabled:border-transparent disabled:bg-transparent disabled:text-slate-400 ${className}`}
    >
      {children}
    </button>
  );
}
