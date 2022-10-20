import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { useSubmit } from "@remix-run/react";
import classNames from "classnames";
import { useCallback, useState } from "react";
import type { Range } from "react-date-range";
import { DateRange } from "react-date-range";
import type { DateRange as MyDateRange } from "~/libraries/common";
import { utcNow } from "~/libraries/common";
import { rangeToFormData } from "~/libraries/common";
import { addDays } from "~/libraries/common";

type DateRangeSelectorProps = {
  range: MyDateRange;
  presets: number[];
};

export function DateRangeSelector({ range, presets }: DateRangeSelectorProps) {
  const [currentRange, setCurrentRange] = useState(range);
  const [pendingRange, setPendingRange] = useState(range);

  const submit = useSubmit();
  const [showPicker, setShowPicker] = useState(false);

  const rangeChanged = useCallback((dateRange: Range) => {
    const customRange: MyDateRange = {
      mode: "custom",
      start: dateRange.startDate ?? new Date(),
      end: dateRange.endDate ?? new Date(),
    };
    setPendingRange(customRange);
  }, []);

  const saveDate = useCallback(() => {
    const formData = rangeToFormData(pendingRange);
    const url = new URL(document.location.href);
    submit(formData, { method: "get", action: url.origin + url.pathname });
    setCurrentRange(pendingRange);
    setShowPicker(false);
  }, [pendingRange, submit]);

  const setPreset = useCallback(
    (days: number) => {
      let range: MyDateRange;
      if (days === 0) {
        range = {
          mode: "custom",
          start: new Date(),
          end: new Date(),
        };
        setPendingRange(range);
        return;
      }

      range = {
        mode: "last",
        days,
        start: addDays(utcNow(), -days),
        end: utcNow(),
      };

      const formData = rangeToFormData(range);
      const url = new URL(document.location.href);
      submit(formData, { method: "get", action: url.origin + url.pathname });
      setPendingRange(range);
      setCurrentRange(range);
      setShowPicker(false);
    },
    [submit]
  );

  const cancelDate = useCallback(() => {
    setPendingRange(currentRange);
    setShowPicker(false);
  }, [currentRange]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker((s) => !s)}
        className="group flex items-center rounded-md border border-slate-200 bg-white py-1 px-2 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-600"
      >
        <CalendarIcon className="mr-1 h-3.5 w-3.5 text-slate-500 transition group-hover:text-slate-600" />
        <span>{pickerTitle(currentRange)}</span>
        <ChevronDownIcon className="ml-1 h-5 w-5 text-slate-500 transition group-hover:text-slate-600" />
      </button>
      {showPicker && (
        <div className="absolute top-8 left-0 z-50 mr-2 flex items-stretch rounded-md border border-slate-300 bg-white">
          <div className="flex w-40 flex-col items-stretch border-r border-slate-200">
            {presets.map((days) => {
              return (
                <PresetButton
                  key={days}
                  label={lastDaysTitle(days)}
                  selected={
                    pendingRange.mode === "last" && pendingRange.days === days
                  }
                  onClick={() => {
                    setPreset(days);
                  }}
                />
              );
            })}
            <PresetButton
              label={"Custom"}
              selected={pendingRange.mode === "custom"}
              onClick={() => {
                setPreset(0);
              }}
            />
          </div>
          <div>
            <DateRange
              onChange={(item) => rangeChanged(item["range"])}
              minDate={addDays(new Date(), -180)}
              maxDate={new Date()}
              scroll={{ enabled: true }}
              weekStartsOn={1}
              showDateDisplay={false}
              ranges={[
                {
                  startDate: pendingRange.start,
                  endDate: pendingRange.end,
                  key: "range",
                },
              ]}
            />
            <div className="flex justify-end gap-2 border-t border-slate-300 p-3">
              <button
                onClick={cancelDate}
                className="rounded-md bg-slate-500 p-2 text-sm text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveDate}
                className="rounded-md bg-emerald-500 p-2 text-sm text-white"
              >
                Save date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type PresetButtonProps = {
  label: string;
  onClick: () => void;
  selected: boolean;
};

function PresetButton({ label, onClick, selected }: PresetButtonProps) {
  return (
    <button
      className={classNames(
        "block p-3 text-left text-sm",
        selected ? "bg-slate-300" : "bg-white"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function pickerTitle(range: MyDateRange) {
  switch (range.mode) {
    case "custom":
      return `${dateFormatter.format(range.start)} to ${dateFormatter.format(
        range.end
      )}`;
    case "last":
      return lastDaysTitle(range.days);
    default:
      throw new Error(`Unknown range mode: ${range}`);
  }
}

function lastDaysTitle(days: number) {
  if (days === 1) {
    return "Last 24 hours";
  }
  return `Last ${days} days`;
}