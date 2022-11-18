import { useLogs } from "~/libraries/common/src/hooks/useLogs";
import { LogsFilters } from "~/libraries/ui/src/components/LogsFilters";
import { LogsTabs } from "~/libraries/ui/src/components/LogsTabs";
import dashboardDisabled from "~/libraries/images/ui/dashboard-disabled.png";
import { RectangleGroupIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/libraries/ui/src/components/Buttons/Buttons";
import { useUser } from "~/libraries/common/src/hooks/useUser";
import { useCurrentProject } from "~/libraries/common/src/hooks/useCurrentProject";
import { ProjectKey } from "~/libraries/ui/src/components/ProjectKey";

export default function Dashboard() {
  const logs = useLogs();
  const project = useCurrentProject();
  return (
    <div className="relative h-full overflow-hidden">
      <div className="flex items-end justify-between flex-wrap-reverse gap-y-5 mr-4">
        {logs && <LogsFilters logs={logs} />}
        {project && <ProjectKey projectId={project.id} />}
      </div>
      <LogsTabs selected={"dashboard"} />
      <DashboardComingSoon />
      <div className="">
        <img src={dashboardDisabled} alt="Placeholder dashboard" />
      </div>
    </div>
  );
}

function DashboardComingSoon() {
  const user = useUser();
  return (
    <div className="absolute top-[calc(50%-200px)] left-[calc(50%-260px)] shadow-lg bg-slate-50">
      <div className="flex flex-col gap-y-8 max-w-lg items-center text-center justify-center bg-white border border-slate-200 rounded-md p-10">
        <RectangleGroupIcon className="text-green-600 h-20 w-20" />
        <p className="text-lg text-slate-600">
          View your API data in helpful chart summaries and react to anomolies
          at a glance. Get notified by email when this feature is ready.
        </p>
        <div id="mc_embed_signup" className="relative w-full">
          <form
            action="https://run.us8.list-manage.com/subscribe/post?u=2717041c2f13a9ece7a8d10a2&amp;id=722834a7a0&amp;f_id=00e264e0f0"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="grid grid-cols-1"
            target="_blank"
            noValidate
          >
            <div id="mc_embed_signup_scroll" className="flex justify-center">
              <div className="mc-field-group">
                <input
                  type="hidden"
                  name="EMAIL"
                  value={user?.email}
                  id="mce-EMAIL"
                />
              </div>
              <div className="hidden">
                <input type="hidden" name="tags" value="4878385" />
              </div>
              <div id="mce-responses" className="clear foot">
                <div className="response hidden" id="mce-error-response"></div>
                <div
                  className="response hidden"
                  id="mce-success-response"
                ></div>
              </div>
              <div className="absolute hidden left-[5000px]" aria-hidden="true">
                <input
                  type="text"
                  name="b_2717041c2f13a9ece7a8d10a2_722834a7a0"
                  tabIndex={-1}
                />
              </div>
              <PrimaryButton
                name="submit"
                id="mc-embedded-subscribe"
                className="px-4 py-2 text-base"
              >
                <MegaphoneIcon className="h-5 w-5" />
                Notify me
              </PrimaryButton>
            </div>
          </form>
        </div>
        <p className="text-sm text-slate-400">
          We’ll notify you when this feature is ready, and might ask how you're
          getting on with it so we can make improvements.
        </p>
      </div>
    </div>
  );
}
