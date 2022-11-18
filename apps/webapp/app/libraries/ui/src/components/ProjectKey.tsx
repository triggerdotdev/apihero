import { CopyTextButton } from "./Buttons/CopyTextButton";
import { Label } from "./Primitives/Label";

export function ProjectKey({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Label label="Project key" />
      <div className="flex items-center justify-between min-w-[200px] bg-white rounded border border-slate-200 pr-1.5">
        <span className="py-2 px-3 text-slate-600 text-sm select-all">
          {projectId}
        </span>
        <CopyTextButton value={projectId} variant="slate" className="text-xs" />
      </div>
    </div>
  );
}
