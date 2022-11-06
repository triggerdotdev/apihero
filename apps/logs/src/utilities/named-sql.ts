type QueryReducerArray = [string, any[], number];

export function namedParameters(
  parameterizedSql: string,
  params: Record<string, string | number | boolean | Date>
) {
  const [text, values] = Object.entries(params).reduce(
    ([sql, array, index], [key, value]) =>
      [
        sql.replace(`:${key}`, `$${index}`),
        [...array, value],
        index + 1,
      ] as QueryReducerArray,
    [parameterizedSql, [], 1] as QueryReducerArray
  );
  return { text, values };
}
