import { ErrorDisplay } from "~/components/ErrorDisplay";

export function FormInputField({
  label,
  id,
  prefix,
  errors,
  defaultValue,
}: {
  label: string;
  id: string;
  prefix?: string;
  defaultValue?: string | null;
  errors: string[] | undefined;
}) {
  return (
    <div className="sm:col-span-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        {prefix && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          name={id}
          id={id}
          className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          defaultValue={defaultValue ?? ""}
        />
      </div>
      <ErrorDisplay errors={errors} />
    </div>
  );
}
