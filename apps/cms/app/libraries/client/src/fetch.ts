import type { Client, HTTPResponse, RequestRecords } from "./types";
import { GatewayResponseBodySchema } from "./types";

type FetchRequestProps<EndpointProps extends RequestRecords> = {
  id: string;
  client: Client;
  requestProps: EndpointProps;
};

export async function fetchRequest<
  ResponseBodyType,
  EndpointProps extends RequestRecords
>({
  id,
  client,
  requestProps,
}: FetchRequestProps<EndpointProps>): Promise<HTTPResponse<ResponseBodyType>> {
  const apiUrl = `${client.gateway.gatewayUrl}/api/${client.gateway.projectId}/${client.name}/${id}`;

  const body = {
    props: requestProps,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const gatewayJson = await response.json();
  const parsedGateway = GatewayResponseBodySchema.safeParse(gatewayJson);

  if (!parsedGateway.success) {
    throw new Error(
      "Internal error: gateway response is not in the correct format"
    );
  }

  //we surface developer errors by throwing, these must be fixed by the developer. They're not errors from the API response
  if (parsedGateway.data.hasError) {
    throw parsedGateway.data.error;
  }

  const responseInfo = {
    headers: fetchHeaders(parsedGateway.data.response.headers),
    ok: parsedGateway.data.response.ok,
    redirected: parsedGateway.data.response.redirected,
    status: parsedGateway.data.response.status,
    statusText: parsedGateway.data.response.statusText,
    type: parsedGateway.data.response.type,
    url: parsedGateway.data.response.url,
  };

  if (!responseInfo.ok) {
    return {
      ...responseInfo,
      body: () => {
        throw new Error(
          `You shouldn't get the body when the response is not ok, call errorBody() instead`
        );
      },
      errorBody: () => {
        if (parsedGateway.data.hasError) {
          throw parsedGateway.data.error;
        }

        return parsedGateway.data.response.body;
      },
    };
  }

  return {
    ...responseInfo,
    body: () => {
      if (parsedGateway.data.hasError) {
        throw new Error(parsedGateway.data.error.message);
      }

      return parsedGateway.data.response.body;
    },
    errorBody: () => {
      if (!parsedGateway.data.hasError) {
        throw new Error(
          `You shouldn't get the errorBody when the response is not an error. Call body()`
        );
      }
      return parsedGateway.data.error;
    },
  };
}

function headers(): Headers {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");
  return headers;
}

function fetchHeaders(records: Record<string, string>): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(records)) {
    headers.append(key, value);
  }
  return headers;
}
