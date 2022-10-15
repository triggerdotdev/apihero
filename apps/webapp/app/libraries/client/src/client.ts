import type { Client, ClientConfig, Gateway } from "./types";

export function createClient(
  gateway: Gateway,
  name: string,
  clientConfig: ClientConfig
): Client {
  const client = {
    name: name,
    config: clientConfig,
    gateway: gateway,
  };

  return client;
}
