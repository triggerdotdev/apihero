import { apiHero } from "../index";
import { z } from "zod";
import { createClient } from "../src/client";
import { createEndpoint } from "../src/react";

const gateway = apiHero.gateway({
  gatewayUrl: "http://localhost:3000",
  projectId: "cl6ev8x4n0047jrrz3qslq7md",
});

const gitHubClient = createClient(gateway, "github", {
  baseUrl: "https://api.github.com",
  authorization: {
    type: "basic",
    usernameKey: "GITHUB_USERNAME",
    passwordKey: "GITHUB_PASSWORD",
  },
  cacheTtl: 10,
});

type StarsEndpointProps = {
  org: string;
  repo: string;
};

export const useGetStars = createEndpoint<StarsEndpointProps>(
  gitHubClient,
  "get-stars",
  "repos/{org}/{repo}",
  {
    timeout: 1000,
  }
).get(
  z
    .object({
      id: z.number(),
      full_name: z.string(),
      stargazers_count: z.number(),
    })
    .passthrough()
);
