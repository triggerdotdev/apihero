import { Menu, Transition } from "@headlessui/react";
import { CalendarIcon, ChatAltIcon, MailIcon } from "@heroicons/react/solid";
import MattAvatar from "~/assets/images/founders/matt.jpg";

export function FeedbackMenu() {
  return (
    <Menu as="div" className="relative z-50 ml-1">
      <div>
        <Menu.Button className="group flex items-center justify-center gap-1 rounded border border-slate-200 bg-white py-1 px-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-600">
          <ChatAltIcon className="h-4 w-4 transition group-hover:text-blue-600" />
          <span>Let’s talk</span>
        </Menu.Button>
      </div>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 flex w-80 origin-top-right flex-col gap-2 rounded-md bg-white px-5 pb-2 pt-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="mt-4 flex gap-2">
            <img
              className="h-14 w-14 rounded-full"
              src={MattAvatar}
              alt="Matt Aitken, founder of API Hero"
            />
            <p className="text-lg font-semibold leading-6 text-slate-700">
              We’re looking for feedback
            </p>
          </div>
          <div className="relative mb-3 flex flex-col gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 shadow-md">
            <span className="absolute left-[22px] -top-[7px] h-3 w-3 rotate-45 border-l border-t border-blue-200 bg-blue-50"></span>
            <p className="mb-2 text-sm text-slate-800">
              If you have any questions or feedback about API Hero, we’d love to
              hear from you. Please schedule a call or send me an email and i’ll
              be more than happy to chat.
            </p>
            <Menu.Item>
              <a
                href="https://cal.com/team/apihero/product-feedback"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center whitespace-nowrap rounded bg-blue-500 py-3 px-4 text-white transition hover:bg-blue-600"
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-white" />
                Schedule a call with Matt
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                className="inline-flex items-center whitespace-nowrap rounded bg-blue-500 py-3 px-4 text-white transition hover:bg-blue-600"
                href="mailto:hello@apihero.run"
              >
                <MailIcon className="mr-2 h-5 w-5 text-white" />
                Send Matt an email
              </a>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
