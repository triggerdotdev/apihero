import {
  AnyFunction,
  LazyCallbackOptions,
} from "@mswjs/interceptors/lib/utils/createLazyCallback";

export type ImmediateCallbackReturnType<FnType extends AnyFunction> =
  | Parameters<FnType>
  | [];

export interface ImmediateCallback<FnType extends AnyFunction> {
  (...args: Parameters<FnType>): void;
  invoked(): ImmediateCallbackReturnType<FnType>;
}

export function createImmediateCallback<FnType extends AnyFunction>(
  options: LazyCallbackOptions = {}
): ImmediateCallback<FnType> {
  let calledTimes = 0;
  let resolve: ImmediateCallbackReturnType<FnType>;

  const fn: ImmediateCallback<FnType> = function (...args) {
    if (options.maxCalls && calledTimes >= options.maxCalls) {
      options.maxCallsCallback?.();
    }

    resolve = args;
    calledTimes++;
  };

  fn.invoked = () => {
    return resolve;
  };

  return fn;
}
