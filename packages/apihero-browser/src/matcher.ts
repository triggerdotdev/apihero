export interface Options {
  readonly caseSensitive?: boolean;
  readonly allPatterns?: boolean;
}

const regexpCache = new Map();

const sanitizeArray = (
  input: string | readonly string[],
  inputName: string
): string[] => {
  let sanitizedInput = input;

  if (!Array.isArray(sanitizedInput)) {
    switch (typeof input) {
      case "string":
        sanitizedInput = [input];
        break;
      case "undefined":
        sanitizedInput = [];
        break;
      default:
        sanitizedInput = [];
        throw new TypeError(
          `Expected '${inputName}' to be a string or an array, but got a type of '${typeof input}'`
        );
    }
  }

  return (sanitizedInput as string[]).filter((string) => {
    if (typeof string !== "string") {
      if (typeof string === "undefined") {
        return false;
      }

      throw new TypeError(
        `Expected '${inputName}' to be an array of strings, but found a type of '${typeof string}' in the array`
      );
    }

    return true;
  });
};

const makeRegexp = (pattern: string, options: Options) => {
  options = {
    caseSensitive: false,
    ...options,
  };

  const cacheKey = pattern + JSON.stringify(options);

  if (regexpCache.has(cacheKey)) {
    return regexpCache.get(cacheKey);
  }

  const negated = pattern[0] === "!";

  if (negated) {
    pattern = pattern.slice(1);
  }

  pattern = escapeStringRegexp(pattern).replace(/\\\*/g, "[\\s\\S]*");

  const regexp = new RegExp(`^${pattern}$`, options.caseSensitive ? "" : "i");
  (regexp as any).negated = negated;
  regexpCache.set(cacheKey, regexp);

  return regexp;
};

const baseMatcher = (
  inputs: string | readonly string[],
  patterns: string | readonly string[],
  options?: Options,
  firstMatchOnly?: boolean
) => {
  const sanitizedInputs = sanitizeArray(inputs, "inputs");
  const sanitizedPatterns = sanitizeArray(patterns, "patterns");

  if (patterns.length === 0) {
    return [];
  }

  const regexPatterns = sanitizedPatterns.map((pattern) =>
    makeRegexp(pattern, options ?? {})
  );

  const { allPatterns } = options || {};
  const result = [];

  for (const input of sanitizedInputs) {
    // String is included only if it matches at least one non-negated pattern supplied.
    // Note: the `allPatterns` option requires every non-negated pattern to be matched once.
    // Matching a negated pattern excludes the string.
    let matches;
    const didFit = [...regexPatterns].fill(false);

    for (const [index, pattern] of regexPatterns.entries()) {
      if (pattern.test(input)) {
        didFit[index] = true;
        matches = !pattern.negated;

        if (!matches) {
          break;
        }
      }
    }

    if (
      !(
        matches === false ||
        (matches === undefined &&
          regexPatterns.some((pattern) => !pattern.negated)) ||
        (allPatterns &&
          didFit.some(
            (yes, index) => !yes && !(patterns[index] as any).negated
          ))
      )
    ) {
      result.push(input);

      if (firstMatchOnly) {
        break;
      }
    }
  }

  return result;
};

export function matcher(
  inputs: string | readonly string[],
  patterns: string | readonly string[],
  options?: Options
): string[] {
  return baseMatcher(inputs, patterns, options, false);
}

export function isMatch(
  inputs: string | readonly string[],
  patterns: string | readonly string[],
  options?: Options
): boolean {
  return baseMatcher(inputs, patterns, options, true).length > 0;
}

function escapeStringRegexp(value: string) {
  if (typeof value !== "string") {
    throw new TypeError("Expected a string");
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
