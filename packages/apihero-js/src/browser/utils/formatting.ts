const LIBRARY_PREFIX = "[APIHERO]";

export function formatMessage(message: string): string {
  return `${LIBRARY_PREFIX} ${message}`;
}
