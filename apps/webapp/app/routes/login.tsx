import {
  CheckCircleIcon,
  CheckIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { GitHubLoginButton } from "~/libraries/ui";
import { Logo } from "~/libraries/ui/src/components/Logo";
import { commitSession, setRedirectTo } from "~/services/redirectTo.server";
import { getUserId } from "~/services/session.server";

type LoaderData = {
  redirectTo?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");

  if (redirectTo) {
    const session = await setRedirectTo(request, redirectTo);

    return json<LoaderData>(
      { redirectTo },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } else {
    return json({});
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="flex sm:flex-row flex-col">
      <div className="flex flex-col flex-none items-center justify-center w-full sm:w-96 bg-gradient-to-b from-[#314caf] via-[#13266c] to-[#3422a7] p-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-200 lg:text-4xl pb-8">
          APIs as they were meant to be
        </h2>
        <div>
          <div>
            <div className="flex flex-row items-center">
              <CheckCircleIcon className="flex w-10 h-10  text-lime-500 pr-2" />
              <h2 className="flex  text-xl font-bold tracking-tight text-slate-200 lg:text-2xl">
                Small typesafe SDK
              </h2>
            </div>
            <p className="mb-4 text-base lg:mb-12 lg:text-lg text-slate-400">
              Reduce friction and errors with full type safety.
            </p>
          </div>

          <div>
            <div className="flex flex-row items-center">
              <CheckCircleIcon className="flex w-10 h-10  text-lime-500 pr-2" />
              <h2 className="flex  text-xl font-bold tracking-tight text-slate-200 lg:text-2xl">
                Full Observability
              </h2>
            </div>
            <p className="mb-4 text-base lg:mb-12 lg:text-lg text-slate-400">
              View every request and response so you can easily debug issues and
              share requests with your teammates.
            </p>
          </div>

          <div>
            <div className="flex flex-row items-center">
              <CheckCircleIcon className="flex w-10 h-10  text-lime-500 pr-2" />
              <h2 className="flex  text-xl font-bold tracking-tight text-slate-200 lg:text-2xl">
                Simplicity & security
              </h2>
            </div>
            <p className="mb-4 text-base lg:mb-12 lg:text-lg text-slate-400">
              We deal with CORS, storing secrets, caching, validation and much
              more.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-auto h-screen flex-col items-center justify-center align-middle gap-4 overflow-y-scroll bg-gradient-to-r from-[#4669E5] via-[#2B52DE] to-[#644DF5] p-4 sm:items-center lg:flex-row lg:p-0">
        <div className=" flex w-full max-w-xl flex-col justify-between rounded-lg border bg-white shadow-md lg:mt-0 lg:min-h-[430px]">
          <Form
            className="flex flex-col"
            action={`/auth/github${
              data.redirectTo ? `?redirectTo=${data.redirectTo}` : ""
            }`}
            method="post"
          >
            <div className="flex flex-col items-center px-4 pt-6 pb-4 text-center lg:px-10">
              <Logo className="mb-4 h-10 w-auto lg:mb-6 lg:mt-8 lg:h-14" />
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-700 lg:text-4xl">
                The easiest way to integrate third party APIs
              </h2>
              <p className="mb-4 text-base lg:mb-12 lg:text-lg">
                Connect your GitHub account to get started.
              </p>
              <GitHubLoginButton className="mx-auto whitespace-nowrap" />
            </div>
          </Form>
          {
            <Link
              className="mb-4 flex items-center justify-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
              to="/login/magic"
            >
              <EnvelopeIcon className="h-4 w-4" />
              Continue with email
            </Link>
          }
          <div className="w-full rounded-b-lg border-t bg-slate-50 px-8 py-4">
            <p className="text-center text-xs text-slate-500">
              By connecting your GitHub account you agree to our{" "}
              <Link
                className="underline transition hover:text-blue-500"
                to="/legal/terms"
              >
                terms
              </Link>{" "}
              and{" "}
              <Link
                className="underline transition hover:text-blue-500"
                to="/legal/privacy"
              >
                privacy
              </Link>{" "}
              policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
