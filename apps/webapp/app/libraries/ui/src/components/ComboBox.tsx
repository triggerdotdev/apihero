import { useEffect, useState } from "react";
import { Combobox as HeadlessComboBox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";

export type Option = { label: string; value: string };

type SharedProps = {
  name?: string;
  options: Option[];
  allowCustom?: boolean;
  onDelete?: () => void;
};

type SingleComboBoxProps = {
  multiple?: false;
  initialValue: string | undefined;
  onChange?: (value: string) => void;
} & SharedProps;

type MultipleComboBoxProps = {
  multiple: true;
  initialValue: string[];
  onChange?: (value: string[]) => void;
} & SharedProps;

type ComboBoxProps = SingleComboBoxProps | MultipleComboBoxProps;

export function ComboBox(props: ComboBoxProps) {
  if (props.multiple === true) {
    return <MultipleComboBox {...props} />;
  } else {
    return <SingleComboBox {...props} />;
  }
}

export function SingleComboBox({
  name,
  initialValue,
  onChange,
  options,
  allowCustom = false,
  onDelete,
}: SingleComboBoxProps) {
  const [value, setValue] = useState(initialValue);
  const [query, setQuery] = useState("");

  const filteredValues =
    query === ""
      ? options
      : options.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase());
        });

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <>
      {name && value && <input type="hidden" name={name} value={value} />}
      <HeadlessComboBox
        value={value}
        onChange={(v) => {
          setValue(v);
          if (onChange !== undefined) {
            onChange(v);
          }
        }}
      >
        <div className="relative">
          <StyledInput
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(selected: string) =>
              options.find((o) => o.value === selected)?.label ?? selected
            }
          />
          <StyledButton>
            <StyledChevron />
          </StyledButton>
          <StyledOptions>
            {onDelete && (
              <button
                className={
                  "group relative flex w-full cursor-default select-none items-center gap-2 py-2 pl-3 pr-9 text-left text-rose-500 hover:bg-rose-500 hover:text-white"
                }
                onClick={() => onDelete()}
              >
                <TrashIcon className="h-4 w-4 text-rose-500 group-hover:text-white" />
                <span>Delete</span>
              </button>
            )}
            {allowCustom && query.length > 0 && (
              <StyledOption value={query}>Create "{query}"</StyledOption>
            )}
            {filteredValues.map((v) => {
              return (
                <StyledOption key={v.value} value={v.value}>
                  {({ active, selected }) => (
                    <>
                      <span
                        className={classNames("block truncate", selected && "")}
                      >
                        {v.label}
                      </span>

                      {selected && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                            active ? "text-white" : "text-blue-600"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </StyledOption>
              );
            })}
          </StyledOptions>
        </div>
      </HeadlessComboBox>
    </>
  );
}

export function MultipleComboBox({
  name,
  initialValue,
  onChange,
  options,
  allowCustom = false,
  onDelete,
}: MultipleComboBoxProps) {
  const [values, setValues] = useState<string[]>(initialValue);
  const [query, setQuery] = useState("");

  const filteredValues =
    query === ""
      ? options
      : options.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase());
        });

  useEffect(() => {
    setValues(initialValue);
  }, [initialValue]);

  return (
    <>
      {name &&
        values.map((v) => (
          <input key={v} type="hidden" name={name} value={v} />
        ))}
      <HeadlessComboBox
        value={values}
        onChange={(v) => {
          setValues(v);
          if (onChange !== undefined) {
            onChange(v);
          }
        }}
        multiple
      >
        <div className="relative">
          <StyledInput
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(selected: string[]) => {
              const selectedLabels = options
                .filter((o) => selected.includes(o.value))
                .map((o) => o.label);
              return selectedLabels.join(", ");
            }}
          />
          <StyledButton>
            <StyledChevron />
          </StyledButton>
          <StyledOptions>
            {onDelete && (
              <button
                className={
                  "group relative flex w-full cursor-default select-none items-center gap-2 py-2 pl-3 pr-9 text-left text-rose-500 hover:bg-rose-500 hover:text-white"
                }
                onClick={() => onDelete()}
              >
                <TrashIcon className="h-4 w-4 text-rose-500 group-hover:text-white" />
                <span>Delete</span>
              </button>
            )}
            {allowCustom && query.length > 0 && (
              <StyledOption value={query}>Create "{query}"</StyledOption>
            )}
            {filteredValues.map((v) => {
              return (
                <StyledOption key={v.value} value={v.value}>
                  {({ active }) => {
                    const selected = values.includes(v.value);
                    return (
                      <>
                        <span
                          className={classNames(
                            "block truncate",
                            selected && ""
                          )}
                        >
                          {v.label}
                        </span>

                        {selected && (
                          <span
                            className={classNames(
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                              active ? "text-slate-600" : "text-slate-600"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    );
                  }}
                </StyledOption>
              );
            })}
          </StyledOptions>
        </div>
      </HeadlessComboBox>
    </>
  );
}

export function StyledInput(
  props: Parameters<typeof HeadlessComboBox.Input>[0]
) {
  return (
    <HeadlessComboBox.Input
      className="w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
      {...props}
    />
  );
}

export function StyledButton(
  props: Parameters<typeof HeadlessComboBox.Button>[0]
) {
  return (
    <HeadlessComboBox.Button
      className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
      {...props}
    />
  );
}

export function StyledOptions(
  props: Parameters<typeof HeadlessComboBox.Options>[0]
) {
  return (
    <HeadlessComboBox.Options
      className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      {...props}
    />
  );
}

export function StyledOption(
  props: Parameters<typeof HeadlessComboBox.Option>[0]
) {
  return (
    <HeadlessComboBox.Option
      className={({
        active,
        selected,
      }: {
        active: boolean;
        selected: boolean;
      }) =>
        classNames(
          "relative cursor-default rounded select-none py-2 pl-3 pr-9",
          active ? "bg-slate-100 transition text-slate-600" : "text-slate-600",
          selected ? "bg-slate-200" : ""
        )
      }
      {...props}
    />
  );
}

export function StyledChevron() {
  return (
    <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
  );
}
