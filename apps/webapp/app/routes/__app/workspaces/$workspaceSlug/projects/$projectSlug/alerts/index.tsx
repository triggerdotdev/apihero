import { useUser } from "~/libraries/common";
import { FireIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/libraries/ui/src/components/Buttons/Buttons";

export default function Alerts() {
  const user = useUser();
  return (
    <div className="bg-slate-50 w-full flex items-center justify-center">
      <div className="flex flex-col gap-y-8 max-w-lg items-center text-center justify-center bg-slate-100 border border-slate-200 rounded-md p-10">
        <FireIcon className="text-orange-600 h-20 w-20" />
        <p className="text-lg text-slate-600">
          Get alerted when any of your APIs return an error, get near their rate
          limits and more. Be first to know when this feature is ready by
          entering your email below.
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
                  // className="hidden"
                  id="mce-EMAIL"
                />
              </div>
              <div className="hidden">
                <input type="hidden" name="tags" value="4878349" />
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
