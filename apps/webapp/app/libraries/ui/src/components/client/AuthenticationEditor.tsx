import { CheckIcon } from "@heroicons/react/24/solid";
import type {
  ApiSchemaSecurityScheme,
  HttpClientAuthentication,
} from ".prisma/client";
import { Form, useTransition } from "@remix-run/react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  SecondaryDestructiveButton,
} from "~/libraries/common";
import { Panel } from "../Panel/Panel";
import { PanelBody } from "../Panel/PanelBody";
import { PanelHeader } from "../Panel/PanelHeader";
import { AuthenticationBadge } from "./AuthenticationBadge";

type SecurityEditorProps = {
  scheme: ApiSchemaSecurityScheme;
  authentication?: HttpClientAuthentication;
};

export function SecurityEditor({
  scheme,
  authentication,
}: SecurityEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const transition = useTransition();
  const isSubmitting =
    transition.state === "submitting" || transition.state === "loading";

  useEffect(() => {
    if (transition.state === "idle") {
      setIsEditing(false);
    }
  }, [transition.state]);

  return (
    <Panel key={scheme.id}>
      <PanelHeader className="flex items-start justify-between">
        <span>{scheme.title}</span>
        <AuthenticationBadge name={scheme.title ?? scheme.identifier} />
      </PanelHeader>
      <PanelBody>
        {scheme.description && (
          <div
            className="prose prose-sm prose-slate"
            dangerouslySetInnerHTML={{
              __html: marked(scheme.description),
            }}
          ></div>
        )}
        {!isEditing && (
          <div>
            <div className="mt-3 flex items-center gap-3">
              {authentication ? (
                <>
                  <AddedButton />
                  <SecondaryButton onClick={() => setIsEditing(true)}>
                    Edit
                  </SecondaryButton>

                  <AuthenticationPreview
                    scheme={scheme}
                    authentication={authentication}
                  />
                </>
              ) : (
                <PrimaryButton onClick={() => setIsEditing(true)}>
                  Add
                </PrimaryButton>
              )}
            </div>
          </div>
        )}
        {isEditing && (
          <>
            <Form method="delete" id="delete-form"></Form>
            <Form className="mt-2 flex max-w-xl flex-col gap-4" method="post">
              <input type="hidden" name="schemeId" value={scheme.id} />
              <AuthenticationForm
                scheme={scheme}
                authentication={authentication}
              />
              <div className="pt-5">
                <div className="flex justify-between">
                  <SecondaryDestructiveButton
                    name="schemeId"
                    type="submit"
                    value={scheme.id}
                    form="delete-form"
                    disabled={isSubmitting}
                  >
                    {transition.submission?.method === "DELETE"
                      ? "Deleting..."
                      : "Delete"}
                  </SecondaryDestructiveButton>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      disabled={isSubmitting}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      name="perform"
                      value="save"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {transition.submission?.formData.get("perform") === "save"
                        ? "Saving..."
                        : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          </>
        )}
      </PanelBody>
    </Panel>
  );
}

function AuthenticationForm({
  scheme,
  authentication,
}: {
  scheme: ApiSchemaSecurityScheme;
  authentication?: HttpClientAuthentication;
}) {
  if (scheme.type === "HTTP") {
    if (scheme.httpScheme === "basic") {
      return (
        <BasicAuthenticationForm
          username={authentication?.username}
          password={authentication?.password}
        />
      );
    }

    if (scheme.httpScheme === "bearer") {
      return <BearerAuthenticationForm token={authentication?.password} />;
    }
  }

  return <div>No Preview</div>;
}

function BasicAuthenticationForm({
  username,
  password,
}: {
  username?: string | null;
  password?: string | null;
}) {
  return (
    <fieldset>
      <input type="hidden" name="httpFormat" value="basic" />
      <div className="sm:col-span-3">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Your username"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            defaultValue={username ?? ""}
          />
        </div>
      </div>
      <div className="sm:col-span-3">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Your password"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            defaultValue={password ?? ""}
          />
        </div>
      </div>
    </fieldset>
  );
}

function BearerAuthenticationForm({ token }: { token?: string | null }) {
  return (
    <fieldset>
      <input type="hidden" name="httpFormat" value="bearer" />
      <div className="sm:col-span-3">
        <label
          htmlFor="token"
          className="block text-sm font-medium text-gray-700"
        >
          Bearer token
        </label>
        <div className="mt-1">
          <input
            type="password"
            name="token"
            id="token"
            placeholder="Your bearer token"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            defaultValue={token ?? ""}
          />
        </div>
      </div>
    </fieldset>
  );
}

function AuthenticationPreview({
  scheme,
  authentication,
}: {
  scheme: ApiSchemaSecurityScheme;
  authentication: HttpClientAuthentication;
}) {
  if (scheme.type === "HTTP") {
    if (scheme.httpScheme === "basic") {
      return <BasicAuthenticationPreview authentication={authentication} />;
    }

    if (scheme.httpScheme === "bearer") {
      return <BearerAuthenticationPreview authentication={authentication} />;
    }
  }

  return <div>No Preview</div>;
}

function BasicAuthenticationPreview({
  authentication,
}: {
  authentication: HttpClientAuthentication;
}) {
  return (
    <div className="text-sm text-gray-500">
      Username: {authentication.username}
    </div>
  );
}

function BearerAuthenticationPreview({
  authentication,
}: {
  authentication: HttpClientAuthentication;
}) {
  return (
    <div className="text-sm text-gray-500">
      Token: {obfuscateToken(authentication.password ?? "missing")}
    </div>
  );
}

// Return at most 12 characters
function obfuscateToken(token: string) {
  return token.replace(/./g, "*").slice(0, 12);
}

function AddedButton() {
  return (
    <div className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100 px-3 py-2 pr-4 text-sm">
      <CheckIcon className="h-4 w-4 text-emerald-700" />
      <p className="text-emerald-700">Added</p>
    </div>
  );
}
