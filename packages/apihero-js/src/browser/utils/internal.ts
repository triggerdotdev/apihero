/**
 * Deeply merges two given objects with the right one
 * having a priority during property assignment.
 */
export function mergeRight(
  left: Record<string, any>,
  right: Record<string, any>
) {
  return Object.entries(right).reduce((result, [key, rightValue]) => {
    const leftValue = result[key];

    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      result[key] = leftValue.concat(rightValue);
      return result;
    }

    if (isObject(leftValue) && isObject(rightValue)) {
      result[key] = mergeRight(leftValue, rightValue);
      return result;
    }

    result[key] = rightValue;
    return result;
  }, Object.assign({}, left));
}

/**
 * Determines if the given value is an object.
 */
function isObject(value: any): boolean {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
