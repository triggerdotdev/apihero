import { FetchInterceptor } from "@apihero/interceptors-js/lib/interceptors/fetch";

const interceptor = new FetchInterceptor();

interceptor.on("request", (request) => {
  const { serverHttpUrl, serverHttpsUrl } = window;

  if (
    [serverHttpUrl, serverHttpsUrl].includes(request.url.href) &&
    request.url.pathname === "/"
  ) {
    const newUrl = new URL(request.url.href);
    newUrl.pathname = "/get";

    request.requestWith({
      url: newUrl,
    });
  }
});

interceptor.apply();

window.interceptor = interceptor;
