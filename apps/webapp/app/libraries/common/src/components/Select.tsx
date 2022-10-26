import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import classnames from "classnames";

export type SelectOption<T> = {
  label: React.ReactNode;
  expandedLabel?: React.ReactNode;
  value: T;
};

export type SelectProps<T> = {
  label: string;
  showLabel?: boolean;
  options: SelectOption<T>[];
  currentOption: SelectOption<T>;
  onChange: (option: SelectOption<T>) => void;
};

export function Select<T>({
  label,
  showLabel = false,
  options,
  currentOption,
  onChange,
}: SelectProps<T>) {
  return (
    <Listbox value={currentOption} onChange={onChange}>
      {({ open }) => (
        <>
          <Listbox.Label
            className={classnames(
              showLabel ? "" : "sr-only",
              "block text-sm font-medium text-gray-700"
            )}
          >
            {label}
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="block truncate">{currentOption.label}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={`${option.value}`}
                    className={({ active }) =>
                      classnames(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classnames(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {option.expandedLabel
                            ? option.expandedLabel
                            : option.label}
                        </span>

                        {selected ? (
                          <span
                            className={classnames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
