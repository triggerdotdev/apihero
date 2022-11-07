import { invariant } from "outvariant";
import { IsomorphicRequest } from "@mswjs/interceptors";
import {
  createLazyCallback,
  LazyCallback,
} from "@mswjs/interceptors/lib/utils/createLazyCallback";
import { ModifiedRequest } from "./types";
import {
  ImmediateCallback,
  createImmediateCallback,
} from "./utils/createImmediateCallback";

export class InteractiveIsomorphicRequest extends IsomorphicRequest {
  public requestWith: LazyCallback<(request: ModifiedRequest) => void>;
  public connectWith: ImmediateCallback<(request: ModifiedRequest) => void>;

  constructor(request: IsomorphicRequest) {
    super(request);

    this.requestWith = createLazyCallback({
      maxCalls: 1,
      maxCallsCallback: () => {
        invariant(
          false,
          'Failed to request with "%s %s": the "request" event has already been responded to.',
          this.method,
          this.url.href
        );
      },
    });

    this.connectWith = createImmediateCallback({
      maxCalls: 1,
      maxCallsCallback: () => {
        invariant(
          false,
          'Failed to connect with "%s %s": the "connect" event has already been responded to.',
          this.method,
          this.url.href
        );
      },
    });
  }
}
