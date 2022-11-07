import { describe } from "vitest";

declare global {
  function setupMiniflareIsolatedStorage(): typeof describe;
}

export {};
