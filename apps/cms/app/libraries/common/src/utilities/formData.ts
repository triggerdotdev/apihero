export function objectToFormData(
  object: Record<string, string | number | boolean>
): FormData {
  const formData = new FormData();

  for (const key of Object.keys(object)) {
    const value = object[key];
    formData.append(key, `${value}`);
  }

  return formData;
}
