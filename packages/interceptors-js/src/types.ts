import type { HeadersObject } from "headers-polyfill";
import type { InteractiveIsomorphicRequest } from "./InteractiveIsomorphicRequest";
import { IsomorphicRequest, IsomorphicResponse } from "@mswjs/interceptors";

export type { IsomorphicResponse };
export { IsomorphicRequest };

export const IS_PATCHED_MODULE: unique symbol = Symbol("isPatchedModule");

export type RequestCredentials = "omit" | "include" | "same-origin";

export interface ModifiedRequest
  extends Omit<Partial<IsomorphicRequest>, "headers"> {
  headers?: HeadersObject;
  body?: string;
}

export type HttpRequestEventMap = {
  connect(request: InteractiveIsomorphicRequest): Promise<void> | void;
  request(request: InteractiveIsomorphicRequest): Promise<void> | void;
  response(
    request: IsomorphicRequest,
    response: IsomorphicResponse
  ): Promise<void> | void;
};
