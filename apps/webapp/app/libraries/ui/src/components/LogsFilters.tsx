import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import type { GetLogsSuccessResponse } from "internal-logs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ComboBox } from "./ComboBox";
import { Input } from "./Primitives/Input";
import { statusCodes } from "./StatusCode";
import { DateRangeSelector } from "~/components/filters/DateRangeSelector";

export function LogsFilters({ logs }: { logs: GetLogsSuccessResponse }) {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams] = useSearchParams();
  const searchObject = Object.fromEntries(searchParams.entries());

  const submitForm = useCallback(() => {
    if (!formRef.current) return;
    submit(formRef.current, { replace: true });
  }, [submit]);

  return (
    <Form
      method="get"
      className="pb-4 flex gap-2"
      onChange={submitForm}
      ref={formRef}
    >
      {searchObject.page && (
        <input type="hidden" name="page" value={searchObject.page} />
      )}
      <FilterTextField
        name="api"
        label="API"
        defaultValue={searchObject.api ?? undefined}
        placeholder="*"
      />
      <FilterTextField
        name="path"
        label="Path"
        defaultValue={searchObject.path ?? undefined}
        placeholder="*"
      />
      <StatusComboBox
        defaultValue={searchObject.status ?? ""}
        submitForm={submitForm}
      />
      <CachingComboBox
        defaultValue={searchObject.cached}
        submitForm={submitForm}
      />
      <FormField label={"Date range"} name={"date"}>
        <DateRangeSelector
          searchObject={searchObject}
          presets={[1, 7, 30, 90, 365]}
          submitForm={submitForm}
        />
      </FormField>
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
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string | undefined;
  placeholder?: string;
}) {
  return (
    <FormField label={label} name={name}>
      <Input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </FormField>
  );
}

function Label({ label, htmlFor }: { label: string; htmlFor: string }) {
  return (
    <label
      className="block text-xs uppercase font-medium text-slate-500 tracking-wide"
      htmlFor={htmlFor}
    >
      {label}
    </label>
  );
}

function CachingComboBox({
  defaultValue,
  submitForm,
}: {
  defaultValue?: string;
  submitForm: () => void;
}) {
  const [cached, setCached] = useState(defaultValue ?? "all");

  useEffect(() => {
    submitForm();
  }, [cached, submitForm]);

  return (
    <FormField label="Caching" name="cached">
      <>
        {cached !== "all" && (
          <input type="hidden" name="cached" defaultValue={cached} />
        )}
        <ComboBox
          options={[
            { label: "All", value: "all" },
            { label: "Only Cached", value: "true" },
            { label: "Only uncached", value: "false" },
          ]}
          initialValue={`${cached}`}
          onChange={setCached}
        />
      </>
    </FormField>
  );
}

function StatusComboBox({
  defaultValue,
  submitForm,
}: {
  defaultValue: string;
  submitForm: () => void;
}) {
  const selected =
    defaultValue === "" ? [] : defaultValue.split(",").map((v) => v.trim());
  const [values, setValues] = useState(
    selected.length > 0 ? selected : everythingCodes
  );

  useEffect(() => {
    submitForm();
  }, [submitForm, values]);

  return (
    <FormField label="Status" name="status">
      <>
        {values.length > 0 && (
          <input type="hidden" name="status" value={values.join(",")} />
        )}
        <ComboBox
          multiple
          options={statusCodeOptions}
          initialValue={values}
          onChange={(changed) => {
            if (changed.some((v) => v === "all") || changed.length === 0) {
              setValues(everythingCodes);
            } else {
              setValues(changed);
            }
          }}
        />
      </>
    </FormField>
  );
}

const everythingCodes = ["2**", "3**", "4**", "5**"];

const statusCodeOptions = [
  { label: "All", value: "all" },
  { label: "Success (2xx)", value: "2**" },
  { label: "Redirect (3xx)", value: "3**" },
  { label: "Client Error (4xx)", value: "4**" },
  { label: "Server Error (5xx)", value: "5**" },
  ...statusCodes.map((code) => ({
    label: `${code}`,
    value: `${code}`,
  })),
];
