export type PolicyMatcher = {
  method: string;
  url: string;
};

export type PolicyRule = string | PolicyMatcher;

export interface SetupProxyOptions {
  projectKey: string;
  url: string;
  allow?: Array<PolicyRule>;
  deny?: Array<PolicyRule>;
  env?: string;
}
