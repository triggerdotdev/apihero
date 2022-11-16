export function Label({ label, htmlFor }: { label: string; htmlFor?: string }) {
  return (
    <label
      className="block text-xs uppercase font-medium text-slate-500 tracking-wide"
      htmlFor={htmlFor}
    >
      {label}
    </label>
  );
}
