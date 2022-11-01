import { Headers, HeadersObject } from "headers-polyfill";

import { expect } from "vitest";

expect.extend({
  toMatchHeaders(received: Headers, expected: HeadersObject) {
    const pass = Object.entries(expected).every(([name, value]) => {
      return received.get(name) === value;
    });

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} not to match headers ${this.utils.printExpected(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} to match headers ${this.utils.printExpected(expected)}`,
        pass: false,
      };
    }
  },
  toBeAnyUuid(received: string) {
    const pass = received.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} not to be any UUID`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} to be any UUID`,
        pass: false,
      };
    }
  },
});

interface CustomMatchers<R = unknown> {
  toBeAnyUuid(): R;
  toMatchHeaders(expected: HeadersObject): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Assertion extends CustomMatchers {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}
