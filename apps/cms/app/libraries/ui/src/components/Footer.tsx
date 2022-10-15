import { Link } from "@remix-run/react";

export function Footer() {
  const linkStyle =
    "rounded-full bg-slate-100 text-xs font-medium text-slate-700 xl:rounded-none whitespace-nowrap xl:p-0 px-3 py-1 xl:bg-transparent xl:text-slate-500 transition hover:text-blue-500 hover:underline";

  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-5 border-t border-gray-200 bg-white px-2 pt-6 pb-4 xl:flex-row xl:gap-0 xl:py-1">
      <p className="text-xs text-slate-500">
        &copy; API Hero 2022 <span className="text-slate-300">|</span>{" "}
        <Link className="transition hover:text-blue-500" to="/legal/terms">
          Terms
        </Link>{" "}
        <span className="text-slate-300">|</span>{" "}
        <Link className="transition hover:text-blue-500" to="/legal/privacy">
          Privacy
        </Link>
      </p>

      <div className="mr-2 flex items-center gap-6">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://discord.com/channels/946768798457921646/1020286418343448586"
          className={linkStyle}
        >
          Discord
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://twitter.com/runapihero"
          className={linkStyle}
        >
          Twitter
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://blog.apihero.run/"
          className={linkStyle}
        >
          Blog
        </a>

        <a href="mailto:hello@apihero.run" className={linkStyle}>
          Get in touch
        </a>
      </div>
    </div>
  );
}
