import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

export type DataAvgDurationProps = {
  avgDuration: number;
};

export function DataAvgDuration({ avgDuration }: DataAvgDurationProps) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full pr-1">
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Avg. duration:
      </p>
      {avgDuration >= 1000 ? (
        <div className="flex gap-1 rounded-full bg-rose-100 px-3 py-1 pl-1">
          <ExclamationCircleIcon className="h-5 w-5 text-rose-500" />
          <p className=" text-sm font-bold text-rose-800">
            {Math.floor(avgDuration)}ms
          </p>
        </div>
      ) : (
        <div className="flex gap-1 rounded-full bg-emerald-100 px-3 py-1 pl-1">
          <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
          <p className=" text-sm font-bold text-emerald-800">
            {Math.floor(avgDuration)}ms
          </p>
        </div>
      )}
    </div>
  );
}
