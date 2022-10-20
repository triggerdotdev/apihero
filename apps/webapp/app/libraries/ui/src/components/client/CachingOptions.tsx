import { Switch } from "@headlessui/react";
import type { HttpClient } from ".prisma/client";
import { Form, useSubmit, useTransition } from "@remix-run/react";
import classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import { useTypedActionData } from "remix-typedjson";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { PrimaryButton } from "~/libraries/common";
import { objectToFormData } from "~/libraries/common/src/utilities/formData";
import type { ActionData } from "~/routes/workspaces/$workspaceSlug/projects/$projectSlug";
import { SmallTitle } from "../Primitives/SmallTitle";

export function CachingOptions({
  origin,
  client,
}: {
  origin?: string;
  client: HttpClient;
}) {
  const [enabled, setEnabled] = useState(client.cacheEnabled);
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const actionData = useTypedActionData<ActionData>();
  const transition = useTransition();

  const isSubmitting =
    (transition.state === "submitting" &&
      transition.type === "actionSubmission" &&
      transition.submission.formData.get("type") === "updateTime") ||
    (transition.state === "loading" &&
      transition.type === "actionReload" &&
      transition.submission.formData.get("type") === "updateTime");

  const toggledCaching = useCallback(
    (isOn) => {
      if (!formRef.current) return;
      setEnabled(isOn);
      const formData = objectToFormData({
        type: "toggle",
        enabled: isOn,
        clientId: client.id,
      });

      submit(formData, { method: "post" });
    },
    [client, submit]
  );

  return (
    <Form className="flex flex-col gap-1" method="post" ref={formRef}>
      <input type="hidden" name="clientId" value={client.id} />
      <div className="flex justify-between">
        <SmallTitle className="font-semibold">Caching</SmallTitle>
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-600">Enable caching</p>
          <Switch
            checked={enabled}
            onChange={toggledCaching}
            className={classNames(
              enabled ? "bg-blue-600" : "bg-slate-200",
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
            )}
          >
            <span className="sr-only">Toggle caching on or off</span>
            <span
              aria-hidden="true"
              className={classNames(
                enabled ? "translate-x-5" : "translate-x-0",
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              )}
            />
          </Switch>
        </div>
      </div>
      <div className="flex justify-between">
        {enabled ? (
          <div className="flex w-full justify-between rounded-lg border border-slate-200 bg-slate-100 p-3">
            <div className="flex items-center gap-2">
              <input type="hidden" name="type" value="updateTime" />
              <input
                type="number"
                className="w-20 rounded border-slate-300 bg-white"
                name="time"
                min={1}
                max={60 * 60 * 24 * 365}
                step={1}
                defaultValue={client.cacheTtl}
              />
              <p className="font-base text-slate-600">Seconds</p>
            </div>
            <PrimaryButton disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        ) : (
          <CachingOff origin={origin} />
        )}
      </div>
      <ErrorDisplay errors={actionData?.errors?.enabled?._errors} />
      <ErrorDisplay errors={actionData?.errors?.time?._errors} />
      <ErrorDisplay
        errors={
          actionData?.errors?.other ? [actionData?.errors?.other] : undefined
        }
      />
    </Form>
  );
}

function CachingOff({ origin }: { origin?: string }) {
  return (
    <p className="font-base text-slate-600">
      Enable caching to increase performance and reduce the number of requests
      to {origin ? new URL(origin).hostname : "the origin"}. Keeping this
      disabled does not prevent caching via Cache-Control headers.
    </p>
  );
}
