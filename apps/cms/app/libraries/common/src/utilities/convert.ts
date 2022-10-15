export function toObject(
  parameters: any[],
  keyName: string = "key",
  valueName: string = "value"
): {
  [key: string]: string;
} {
  return Object.assign(
    {},
    ...parameters.map((h) => {
      const key = h[keyName];
      const value = h[valueName];
      return { [key]: value };
    })
  );
}
