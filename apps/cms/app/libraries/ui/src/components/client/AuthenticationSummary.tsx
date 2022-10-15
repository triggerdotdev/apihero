import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { ShieldCheckIcon } from "@heroicons/react/solid";
import type {
  HttpClientAuthentication,
  ApiSchemaSecurityScheme,
  Integration,
} from "@prisma/client";
import { Link } from "@remix-run/react";
import { PrimaryButton, SecondaryButton } from "~/libraries/common";
import { SmallTitle } from "../Primitives/SmallTitle";

type AuthenticationProps = {
  integration: Integration;
  active: AuthenticationItem[];
};

type AuthenticationItem = HttpClientAuthentication & {
  securityScheme: ApiSchemaSecurityScheme;
};

export function AuthenticationSummary({
  integration,
  active,
}: AuthenticationProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <SmallTitle className="mb-2 font-semibold">Authentication</SmallTitle>
        {active.length > 0 && (
          <p className="text-sm text-slate-600">
            {active.length} authentication{active.length != 1 && <span>s</span>}{" "}
            set
          </p>
        )}
      </div>

      <div>
        {active.length > 0 ? (
          <div className="flex justify-between gap-4 rounded-lg border border-slate-200 bg-slate-100 p-3">
            <div className="flex flex-col gap-4">
              {active.map((authentication) => {
                return (
                  <EnabledAuthentication
                    key={authentication.id}
                    {...authentication.securityScheme}
                  />
                );
              })}
            </div>
            <Link to={`auth/${integration.slug}`}>
              <SecondaryButton className="flex self-end">Edit</SecondaryButton>
            </Link>
          </div>
        ) : (
          <NoAuthentication slug={integration.slug} />
        )}
      </div>
    </div>
  );
}

function EnabledAuthentication(scheme: ApiSchemaSecurityScheme) {
  return (
    <div className="">
      <div className="flex gap-2">
        <ShieldCheckIcon className="flex h-6 w-6 shrink-0 text-emerald-400" />
        <div className="">
          <div className="text-base font-medium text-slate-900">
            {scheme.title}
          </div>
          <div className="text-sm text-slate-500">{scheme.summary}</div>
        </div>
      </div>
    </div>
  );
}

function NoAuthentication({ slug }: { slug: string }) {
  return (
    <div className="flex justify-between">
      <p className="font-base text-slate-600">
        Add authentication to access more endpoints and higher rate limits.
      </p>
      <Link to={`auth/${slug}`}>
        <PrimaryButton className="flex self-end">Add</PrimaryButton>
      </Link>
    </div>
  );
}
