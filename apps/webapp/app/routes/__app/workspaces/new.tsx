import { BookmarkIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import {
  PrimaryLink,
  SecondaryButton,
  SecondaryLink,
} from "~/libraries/ui/src/components/Buttons/Buttons";
import { createWorkspace } from "~/models/workspace.server";
// import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  // const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  // const workspace = await createWorkspace({ title, userId });
  // return redirect(`/workspaces/${workspace.id}`);
};

export default function NewWorkspacePage() {
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }
  }, [actionData]);

  return (
    <main className="bg-slate-50 w-full h-screen flex items-center justify-center">
      <div className="flex flex-col gap-y-3.5 max-w-lg bg-white shadow border border-slate-200 rounded-md p-10">
        <div className="flex gap-1 items-center">
          <PlusIcon className="text-green-500 h-5 w-5" />
          <h3 className="font-semibold text-slate-600 text-lg">
            Create a new Workspace
          </h3>
        </div>
        <p className="text-slate-600">
          Use Workspaces to hold a collection of Projects. A typical Workspace
          is named after a company or team.
        </p>
        <Form
          method="post"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          <div className="flex flex-col gap-4 mb-3">
            <div className="flex w-full flex-col gap-1">
              <label className="text-slate-500 text-sm">
                Name your Workspace
              </label>
              <div className="group flex">
                <div className="flex justify-end z-10 -mr-8 items-center w-8">
                  <BriefcaseIcon className="h-5 w-5 text-slate-600"></BriefcaseIcon>
                </div>
                <input
                  ref={titleRef}
                  name="title"
                  placeholder="e.g. My first Workspace"
                  className="relative w-full pl-10 pr-3 py-2 rounded-md border text-slate-600 bg-slate-50 group-focus:border-blue-500 placeholder:text-slate-400"
                  aria-invalid={actionData?.errors?.title ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.title ? "title-error" : undefined
                  }
                />
              </div>
            </div>
            {actionData?.errors?.title && (
              <div className="pt-1 text-red-700" id="title-error">
                {actionData.errors.title}
              </div>
            )}
            <div className="flex w-full flex-col gap-1">
              <label className="text-slate-500 text-sm">
                Create a Project to add to your new Workspace
              </label>
              <div className="group flex">
                <div className="flex justify-end z-10 -mr-8 items-center w-8">
                  <BookmarkIcon className="h-5 w-5 text-slate-600"></BookmarkIcon>
                </div>
                <input
                  ref={titleRef}
                  name="title"
                  placeholder="e.g. My first Project"
                  className="relative w-full pl-10 pr-3 py-2 rounded-md border text-slate-600 bg-slate-50 group-focus:border-blue-500 placeholder:text-slate-400"
                  aria-invalid={actionData?.errors?.title ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.title ? "title-error" : undefined
                  }
                />
              </div>
            </div>
            {actionData?.errors?.title && (
              <div className="pt-1 text-red-700" id="title-error">
                {actionData.errors.title}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <SecondaryLink
              to="/"
              type="submit"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Cancel
            </SecondaryLink>
            <PrimaryLink
              to="/"
              type="submit"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Create
            </PrimaryLink>
          </div>
        </Form>
      </div>
    </main>
  );
}
