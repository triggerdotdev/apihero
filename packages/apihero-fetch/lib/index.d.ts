type FetchFunction = typeof fetch;
type FetchProxyOptions = {
    projectKey: string;
    url?: string;
    env?: string;
};
declare function createFetchProxy(options: FetchProxyOptions): FetchFunction;

export { FetchFunction, FetchProxyOptions, createFetchProxy };
