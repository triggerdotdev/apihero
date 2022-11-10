import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import type { GetLogsSuccessResponse } from "internal-logs";
import React, { useState } from "react";
import { ComboBox } from "./ComboBox";
import { Input } from "./Primitives/Input";
import { statusCodes } from "./StatusCode";

export function LogsFilters({ logs }: { logs: GetLogsSuccessResponse }) {
  const [searchParams] = useSearchParams();
  const searchObject = Object.fromEntries(searchParams.entries());

  return (
    <Form method="get" className="py-4 flex gap-2">
      {searchObject.page && (
        <input type="hidden" name="page" value={searchObject.page} />
      )}
      <FilterTextField
        name="api"
        label="API"
        defaultValue={searchObject.api ?? undefined}
      />
      <FilterTextField
        name="path"
        label="Path"
        defaultValue={searchObject.path ?? undefined}
      />
      <StatusComboBox defaultValue={searchObject.status ?? ""} />

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

function StatusComboBox({ defaultValue }: { defaultValue: string }) {
  const selected =
    defaultValue === "" ? [] : defaultValue.split(",").map((v) => v.trim());
  const [values, setValues] = useState(selected);

  const inputValues = values.filter((v) => v !== "all");

  return (
    <FormField label="Status" name="status">
      <>
        {inputValues.length > 0 && (
          <input type="hidden" name="status" value={inputValues.join(",")} />
        )}
        <ComboBox
          multiple
          options={statusCodeOptions}
          initialValue={selected}
          onChange={(values) => {
            if (values.some((v) => v === "all")) {
              setValues(["all"]);
            } else {
              setValues(values);
            }
          }}
        />
      </>
    </FormField>
  );
}

const statusCodeOptions = [
  { label: "All", value: "all" },
  { label: "Success", value: "2**" },
  { label: "Redirect", value: "3**" },
  { label: "Client Error", value: "4**" },
  { label: "Server Error", value: "5**" },
  ...statusCodes.map((code) => ({
    label: `${code}`,
    value: `${code}`,
  })),
];
