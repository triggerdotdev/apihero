import classnames from "classnames";

type KeyValueListProps = {
  data: Record<string, string>;
  keyTitle?: string;
  valueTitle?: string;
  showTitle?: boolean;
};

const gridClassname =
  "grid grid-cols-[200px_minmax(10px,_2000px)] gap-2 w-full";

export function KeyValueList({
  data,
  keyTitle = "Key",
  valueTitle = "Value",
  showTitle = true,
}: KeyValueListProps) {
  return (
    <div className="overflow-auto">
      <div
        className={classnames(gridClassname, "py-1", showTitle ? "" : "hidden")}
      >
        <div className="text-xs uppercase">{keyTitle}</div>
        <div className="text-xs uppercase">{valueTitle}</div>
      </div>
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className={classnames(
            gridClassname,
            "text-xs",
            "w-full rounded even:bg-slate-50"
          )}
        >
          <div className="min-w-fit max-w-fit py-2 pl-2">{key}</div>
          <div className="min-w-fit py-2 pr-2">
            {value !== undefined ? value : "undefined"}
          </div>
        </div>
      ))}
    </div>
  );
}
