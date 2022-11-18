import { Label } from "./Label";

export function FormField({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:col-span-2">
      <Label label={label} htmlFor={name} />
      <div className="mt-1">{children}</div>
    </div>
  );
}
