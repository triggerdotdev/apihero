import { ApiLogoContainer } from "./ApiLogoContainer";
import GitHubLogo from "../../../../assets/images/api-logos/logo-github.png";
import GoogleLogo from "../../../../assets/images/api-logos/logo-google.png";
import SalesForceLogo from "../../../../assets/images/api-logos/logo-salesforce.png";
import StripeLogo from "../../../../assets/images/api-logos/logo-stripe.png";
import TwilioLogo from "../../../../assets/images/api-logos/logo-twilio.png";
import TwitterLogo from "../../../../assets/images/api-logos/logo-twitter.png";
import XeroLogo from "../../../../assets/images/api-logos/logo-xero.png";
import HubspotLogo from "../../../../assets/images/api-logos/logo-hubspot.png";
import ShopifyLogo from "../../../../assets/images/api-logos/logo-shopify.png";
import SkyscannerLogo from "../../../../assets/images/api-logos/logo-skyscanner.png";
import SlackLogo from "../../../../assets/images/api-logos/logo-slack.png";
import ZendeskLogo from "../../../../assets/images/api-logos/logo-zendesk.png";
import SendgridLogo from "../../../../assets/images/api-logos/logo-sendgrid.png";

export function InfoPanel() {
  return (
    <div className="mb-10 flex w-full flex-col overflow-y-auto px-6 py-6 xl:mb-0 xl:max-w-md xl:border-l xl:border-slate-200 xl:bg-white">
      <h3 className="text-2xl font-bold text-slate-700 xl:font-medium">
        Supported APIs
      </h3>
      <div className="mt-6">
        <p className="mb-4 text-slate-600">
          API Hero currently has support for the GitHub and Twitter APIs and we
          are adding support for new APIs all the time.
        </p>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          Supported
        </h3>
        <ul className="mb-6 flex flex-wrap gap-2">
          <li>
            <ApiLogoContainer ApiLogo={GitHubLogo} isSupported />
          </li>
          <li>
            <ApiLogoContainer ApiLogo={TwitterLogo} isSupported />
          </li>
        </ul>
        <h3 className="mt-6 mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          Up next
        </h3>
        <ul className="mb-6 flex flex-wrap gap-2">
          <ApiLogoContainer ApiLogo={GoogleLogo} />
          <ApiLogoContainer ApiLogo={SalesForceLogo} />
          <ApiLogoContainer ApiLogo={StripeLogo} />
          <ApiLogoContainer ApiLogo={TwilioLogo} />
          <ApiLogoContainer ApiLogo={XeroLogo} />
          <ApiLogoContainer ApiLogo={HubspotLogo} />
          <ApiLogoContainer ApiLogo={ShopifyLogo} />
          <ApiLogoContainer ApiLogo={ZendeskLogo} />
          <ApiLogoContainer ApiLogo={SkyscannerLogo} />
          <ApiLogoContainer ApiLogo={SlackLogo} />
          <ApiLogoContainer ApiLogo={SendgridLogo} />
        </ul>
        <p className="text-slate-600">
          Let us know which APIs we should support next and we’ll email you as
          soon they’re available.
        </p>
        <div id="mc_embed_signup" className="relative">
          <form
            action="https://run.us8.list-manage.com/subscribe/post?u=2717041c2f13a9ece7a8d10a2&amp;id=722834a7a0"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="mt-4 grid grid-cols-1 gap-y-4"
            target="_blank"
            noValidate
          >
            <div id="mc_embed_signup_scroll" className="flex flex-col gap-2">
              <div className="mc-field-group flex flex-col">
                <label
                  htmlFor="mce-EMAIL"
                  className="mb-1 text-xs font-medium text-slate-500"
                >
                  Email Address
                  <span className="asterisk">*</span>
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  className="w-full rounded-md border border-slate-300 bg-slate-100 text-sm"
                  id="mce-EMAIL"
                />
              </div>
              <div className="flex items-end">
                <div className="mc-field-group flex flex-grow flex-col">
                  <label
                    htmlFor="mce-MMERGE1"
                    className="mb-1 text-xs font-medium text-slate-500"
                  >
                    Which APIs should we add next?
                  </label>
                  <input
                    type="text"
                    name="MMERGE1"
                    className="rounded-l-md border-y border-l border-slate-300 bg-slate-100 text-sm placeholder:text-slate-400"
                    id="mce-MMERGE1"
                    placeholder="e.g. Stripe, Twilio, Shopify…"
                  />
                </div>
                <div className="hidden">
                  <input type="hidden" name="tags" value="4873609" />
                </div>
                <div id="mce-responses" className="clear foot">
                  <div
                    className="response hidden"
                    id="mce-error-response"
                  ></div>
                  <div
                    className="response hidden"
                    id="mce-success-response"
                  ></div>
                </div>
                <div
                  className="absolute left-[5000px] hidden"
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    name="b_2717041c2f13a9ece7a8d10a2_722834a7a0"
                    tabIndex={-1}
                  />
                </div>
                <button
                  name="submit"
                  id="mc-embedded-subscribe"
                  className="h-[38px] rounded-r-md bg-blue-500 px-4 text-center text-base font-medium text-white transition hover:cursor-pointer hover:bg-blue-600"
                >
                  &rarr;
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
