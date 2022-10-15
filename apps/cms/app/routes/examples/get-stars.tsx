import { useState } from "react";
import { useGetStars } from "~/libraries/client/example/example1";
import { APIHeroProvider } from "~/libraries/client/src/react";

export default function GetStarsPage() {
  return (
    <APIHeroProvider>
      <GetStars org="jsonhero-io" repo="jsonhero-web" />
      <GetStars org="remix-run" repo="remix" />
      <GetStars org="jsonhero-io" repo="api-hero" />

      {/* <GetStarsForm /> */}
    </APIHeroProvider>
  );
}

function GetStars({ org, repo }: { org: string; repo: string }) {
  const { status, error, data } = useGetStars({ org, repo });

  return (
    <div>
      <h1>
        {org}/{repo} Star Count:
      </h1>

      {status === "loading" ? (
        "Loading..."
      ) : status === "error" ? (
        <span>Error: {JSON.stringify(error)}</span>
      ) : (
        <h2>{data?.stargazers_count}</h2>
      )}
    </div>
  );
}

function GetStarsForm() {
  const [org, setOrg] = useState("");
  const [repo, setRepo] = useState("");

  return (
    <div>
      <input
        value={org}
        onChange={(e) => setOrg(e.target.value)}
        className="border border-gray-500"
      />
      <input
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        className="border border-gray-500"
      />

      <GetStars org={org} repo={repo} />
    </div>
  );
}
