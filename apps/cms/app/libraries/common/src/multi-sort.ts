type Sortings<T, K extends keyof T> = {
  key: K;
  direction: "asc" | "desc";
};

export function sorted<T, K extends keyof T>(
  array: T[],
  sorting: Sortings<T, K>[]
): T[] {
  const copy = [...array];
  copy.sort((a, b) => {
    for (const { key, direction } of sorting) {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  return copy;
}
