import { useQuery } from "@tanstack/react-query";

export function StarCount({ owner, repo }: { owner: string; repo: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["starCount", owner, repo],
    queryFn: () => {
      return fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token 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`,
        },
      }).then((res) => res.json()) as Promise<{ stargazers_count: number }>;
    },
  });

  if (isLoading) return <>Loading..."</>;

  if (error) return <>Error!</>;

  return (
    <>
      <div className="flex h-full w-full flex-col text-2xl mb-5 items-center justify-top">
        <>
          <p className="text-2xl font-mono text-slate-100 mb-2">
            {owner}/{repo}
          </p>
          <h2 className="text-3xl font-bold font-poppins text-slate-100 w-full">
            {Intl.NumberFormat("en-US").format(data?.stargazers_count ?? 0)}{" "}
            stars
          </h2>
        </>
      </div>
    </>
  );
}
