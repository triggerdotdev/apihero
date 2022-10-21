import { ClipboardIcon } from "@heroicons/react/24/outline";
import { useCallback, useState } from "react";
import { CopyText } from "./CopyText";

export type CopyTextButtonProps = {
  value: string;
  className?: string;
};

export function CopyTextButton({ value, className }: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);
  const onCopied = useCallback(() => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, [setCopied]);
  return (
    <CopyText className={`${className}`} value={value} onCopied={onCopied}>
      {copied ? (
        <div className="flex items-center rounded bg-emerald-200 px-2 py-1 text-slate-600 transition hover:cursor-pointer hover:bg-emerald-200">
          <p className=" font-sans text-emerald-700 hover:text-emerald-700">
            Copied!
          </p>
        </div>
      ) : (
        <div className="flex items-center rounded bg-black/[5%] px-2 py-1 text-slate-600 transition hover:cursor-pointer hover:bg-black/10 hover:text-slate-700">
          <ClipboardIcon className="mr-[2px] h-4 w-4" />
          <p className="font-sans">Copy</p>
        </div>
      )}
    </CopyText>
  );
}
