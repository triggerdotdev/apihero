import { useQuery } from "@tanstack/react-query";

export function StarCount({ owner, repo }: { owner: string; repo: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["starCount", owner, repo],
    queryFn: () => {
      return fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
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
