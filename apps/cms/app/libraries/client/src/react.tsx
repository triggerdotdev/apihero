import type { UseQueryResult } from "react-query";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { fetchRequest } from "./fetch";
import type {
  RequestRecords,
  EndpointConfig,
  ProcedureParserZodEsque,
  Client,
} from "./types";

const queryClient = new QueryClient();

export function APIHeroProvider({ children }: { children: React.ReactNode }) {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export function createEndpoint<EndpointProps extends RequestRecords>(
  client: Client,
  id: string,
  path: string,
  config?: EndpointConfig
): {
  get: <TInput, TOutput>(
    schema?: ProcedureParserZodEsque<TInput, TOutput> | undefined
  ) => (props: EndpointProps) => UseQueryResult<TOutput>;
} {
  return {
    get: <TInput, TOutput>(
      schema?: ProcedureParserZodEsque<TInput, TOutput>
    ) => {
      const getFunction = (props: EndpointProps): UseQueryResult<TOutput> => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const useQueryResult = useQuery(
          [id, props],
          async (): Promise<TOutput> => {
            const res = await fetchRequest<TOutput, EndpointProps>({
              id,
              client,
              requestProps: props,
            });

            return res.body();
          }
        );

        return useQueryResult;
      };

      getFunction.__apiHero = {
        id,
        method: "GET",
        client,
        path,
        config,
        schema,
      };

      return getFunction;
    },
  };
}
