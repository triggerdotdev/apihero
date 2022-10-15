import { fetchRequest } from "./fetch";
import type {
  Client,
  EndpointConfig,
  HTTPResponse,
  ProcedureParserZodEsque,
  RequestRecords,
} from "./types";

export function createEndpoint<EndpointProps extends RequestRecords>(
  client: Client,
  id: string,
  path: string,
  config?: EndpointConfig
): {
  get: <TInput, TOutput>(
    schema?: ProcedureParserZodEsque<TInput, TOutput> | undefined
  ) => (props: EndpointProps) => Promise<HTTPResponse<TOutput>>;
} {
  return {
    get: <TInput, TOutput>(
      schema?: ProcedureParserZodEsque<TInput, TOutput>
    ) => {
      const getFunction = (
        props: EndpointProps
      ): Promise<HTTPResponse<TOutput>> => {
        return fetchRequest({
          id,
          client,
          requestProps: props,
        });
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
