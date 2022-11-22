export type PolicyMatcher = {
  method: string;
  url: string;
};

export type PolicyRule = string | PolicyMatcher;

export type SetupProxyOptions = {
  projectKey: string;
  url?: string;
  allow?: Array<PolicyRule>;
  deny?: Array<PolicyRule>;
  env?: string;
};

export type SetupProxyInstance = {
  start(callback?: () => void): void;
  stop(): void;
};

export type ModifiedFetchRequest = {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
};

type Fn = (...arg: unknown[]) => unknown;
export type RequiredDeep<
  Type,
  U extends Record<string, unknown> | Fn | undefined = undefined
> = Type extends Fn
  ? Type
  : /**
   * @note The "Fn" type satisfies the predicate below.
   * It must always come first, before the Record check.
   */
  Type extends Record<string, unknown>
  ? {
      [Key in keyof Type]-?: NonNullable<Type[Key]> extends NonNullable<U>
        ? NonNullable<Type[Key]>
        : RequiredDeep<NonNullable<Type[Key]>, U>;
    }
  : Type;
