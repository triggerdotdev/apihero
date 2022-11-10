import { Form, useSearchParams } from "@remix-run/react";
import type { GetLogsSuccessResponse } from "internal-logs";
import React from "react";
import { Input } from "./Primitives/Input";

export function LogsFilters({ logs }: { logs: GetLogsSuccessResponse }) {
  const [searchParams] = useSearchParams();

  const page = searchParams.get("page");

  return (
    <Form method="get" className="py-4 flex gap-2">
      {page && <input type="hidden" name="page" value={page} />}
      <FilterTextField
        name="api"
        label="API"
        defaultValue={searchParams.get("api") ?? undefined}
      />
      <FilterTextField
        name="path"
        label="Path"
        defaultValue={searchParams.get("path") ?? undefined}
      />
      <button type="submit" className="btn btn-primary">
        Filter
      </button>
    </Form>
  );
}

function FormField({
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

function FilterTextField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | undefined;
}) {
  return (
    <FormField label={label} name={name}>
      <Input type="text" name={name} defaultValue={defaultValue} />
    </FormField>
  );
}

function Label({ label, htmlFor }: { label: string; htmlFor: string }) {
  return (
    <label
      className="block text-sm font-medium text-gray-700"
      htmlFor={htmlFor}
    >
      {label}
    </label>
  );
}
