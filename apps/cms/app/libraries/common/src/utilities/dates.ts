import { objectToFormData } from "./formData";

export function addDays(date: Date, days: number): Date {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function dateToString(date: Date): string {
  return `${date.getUTCFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(date.getDate()).padStart(2, "0")}`;
}

export function dateFromDateString(dateString: string): Date {
  const string = String(dateString);
  const year = string.substring(0, 4);
  const month = string.substring(4, 6);
  const day = string.substring(6, 8);
  return new Date(`${year}-${month}-${day}`);
}

export function utcNow(): Date {
  return new Date(
    Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    )
  );
}

export type SerializedDateRange =
  | SerializedDateRangeCustom
  | SerializedDateRangeLast;
export type DateRange = DateRangeCustom | DateRangeLast;

type DateRangeLast = {
  mode: "last";
  days: number;
  start: Date;
  end: Date;
};

type SerializedDateRangeLast = {
  mode: "last";
  days: number;
};

type DateRangeCustom = {
  mode: "custom";
  start: Date;
  end: Date;
};

type SerializedDateRangeCustom = {
  mode: "custom";
  start: string;
  end: string;
};

export function dateFromSearchParams(
  searchParams: URLSearchParams,
  defaultDays: number = 7
): DateRange {
  const modeString = searchParams.get("mode");

  if (!modeString || modeString === "last") {
    const days = parseInt(searchParams.get("days") || defaultDays.toString());
    const start = addDays(utcNow(), -days);
    const end = utcNow();
    return {
      mode: "last",
      days,
      start,
      end,
    };
  }

  const startString = searchParams.get("start");
  const endString = searchParams.get("end");

  let start: Date = addDays(utcNow(), -defaultDays);
  if (startString) {
    start = dateFromDateString(startString);
  }

  let end: Date = utcNow();
  if (endString) {
    end = dateFromDateString(endString);
  }

  return { mode: "custom", start, end };
}

export function rangeToFormData(range: DateRange): FormData {
  return objectToFormData(rangeToSerializedDateRange(range));
}

export function rangeToSerializedDateRange(
  range: DateRange
): SerializedDateRange {
  switch (range.mode) {
    case "custom":
      return {
        mode: "custom",
        start: dateToString(range.start),
        end: dateToString(range.end),
      };
    case "last":
      return {
        mode: "last",
        days: range.days,
      };
    default:
      throw new Error(`Unknown mode ${range}`);
  }
}

export function serializedDateRangeToRange(
  range: SerializedDateRange
): DateRange {
  switch (range.mode) {
    case "custom":
      return {
        mode: "custom",
        start: dateFromDateString(range.start),
        end: dateFromDateString(range.end),
      };
    case "last":
      return {
        mode: "last",
        days: range.days,
        start: addDays(utcNow(), -range.days),
        end: utcNow(),
      };
    default:
      throw new Error(`Unknown mode ${range}`);
  }
}
