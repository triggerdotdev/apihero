import { StatusCode } from "./StatusCode";

type ResponseInfoProps = {
  status: number;
  duration?: number;
  responseSize?: number;
};

export function ResponseInfo({
  status,
  duration,
  responseSize,
}: ResponseInfoProps) {
  const success = isStatusSuccess(status);
  const messageStyle = `${
    success ? "text-emerald-500" : "text-rose-500"
  } font-bold`;
  return (
    <ol className="flex gap-4 text-xs uppercase">
      <li className="flex flex-wrap gap-1">
        <p className="max-w-fit tracking-wide text-slate-500">Status</p>
        <StatusCode status={status} />
      </li>
      {duration && (
        <li className="flex flex-wrap gap-1">
          <p className="max-w-fit tracking-wide text-slate-500">Time</p>
          <p className={messageStyle}>{Math.round(duration)} ms</p>
        </li>
      )}
      {responseSize && (
        <li className="flex flex-wrap gap-1">
          <p className="max-w-fit tracking-wide text-slate-500">Size</p>
          <p className={messageStyle}>{responseSize} B</p>
        </li>
      )}
    </ol>
  );
}

function isStatusSuccess(status: number): boolean {
  if (status >= 200 && status < 300) return true;
  return false;
}
