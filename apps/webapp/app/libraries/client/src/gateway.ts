import type { Gateway } from "./types";

type GatewayConfig = {
  gatewayUrl?: string;
  projectId: string;
};

export function gateway({
  gatewayUrl = "https://apihero.run",
  projectId,
}: GatewayConfig): Gateway {
  const gateway: Gateway = {
    gatewayUrl,
    projectId,
  };
  return gateway;
}
