import { SmallTitle } from "../Primitives/SmallTitle";

export function AuthenticationDocs() {
  return (
    <div className="flex flex-col gap-1">
      <SmallTitle className="font-semibold">Documentation</SmallTitle>
      <p className="font-base text-slate-600">
        View our{" "}
        <a
          href="https://docs.apihero.run"
          target="_blank"
          className="underline transition hover:text-blue-500"
          rel="noreferrer"
        >
          getting started
        </a>{" "}
        guide.
      </p>
    </div>
  );
}
