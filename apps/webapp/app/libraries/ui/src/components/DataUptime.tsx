import {
  ArrowDownCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

export type DataUptimeProps = {
  uptime: number;
};

export function DataUptime({ uptime }: DataUptimeProps) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full pr-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Last 24Hr:
      </p>
      {uptime <= 99.9 ? (
        <>
          <div className="flex gap-1 rounded-full bg-rose-100 px-3 py-1 pl-1">
            <ArrowDownCircleIcon className="h-5 w-5 text-rose-500" />
            <p className=" text-sm font-bold text-rose-800">
              {Math.ceil(uptime)}%
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-1 rounded-full bg-emerald-100 px-3 py-1 pl-1">
            <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            <p className=" text-sm font-bold text-emerald-800">
              {Math.ceil(uptime)}%
            </p>
          </div>
        </>
      )}
    </div>
  );
}
