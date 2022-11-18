import { until } from "@open-draft/until";
import { ServiceWorkerInstanceTuple } from "../../types";

export const getWorkerInstance = async (
  url: string,
  options: RegistrationOptions = {}
): Promise<ServiceWorkerInstanceTuple> => {
  // Resolve the absolute Service Worker URL.
  const absoluteWorkerUrl = getAbsoluteWorkerUrl(url);

  const proxyRegistrations = await navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      registrations.filter((registration) =>
        getWorkerByRegistration(
          registration,
          absoluteWorkerUrl,
          (scriptURL, proxyServiceWorkerUrl) => {
            return scriptURL === proxyServiceWorkerUrl;
          }
        )
      )
    );
  if (!navigator.serviceWorker.controller && proxyRegistrations.length > 0) {
    // Reload the page when it has associated workers, but no active controller.
    // The absence of a controller can mean either:
    // - page has no Service Worker associated with it
    // - page has been hard-reloaded and its workers won't be used until the next reload.
    // Since we've checked that there are registrations associated with this page,
    // at this point we are sure it's hard reload that falls into this clause.
    location.reload();
  }

  const [existingRegistration] = proxyRegistrations;

  if (existingRegistration) {
    // When the Service Worker is registered, update it and return the reference.
    return existingRegistration.update().then(() => {
      return [
        getWorkerByRegistration(
          existingRegistration,
          absoluteWorkerUrl,
          (scriptURL, proxyServiceWorkerUrl) => {
            return scriptURL === proxyServiceWorkerUrl;
          }
        ),
        existingRegistration,
      ];
    });
  }

  // When the Service Worker wasn't found, register it anew and return the reference.
  const { error, data: instance } = await until<
    Error,
    ServiceWorkerInstanceTuple
  >(async () => {
    const registration = await navigator.serviceWorker.register(url, options);

    return [
      // Compare existing worker registration by its worker URL,
      // to prevent irrelevant workers to resolve here (such as Codesandbox worker).
      getWorkerByRegistration(
        registration,
        absoluteWorkerUrl,
        (scriptURL, proxyServiceWorkerUrl) => {
          return scriptURL === proxyServiceWorkerUrl;
        }
      ),
      registration,
    ];
  });

  // Handle Service Worker registration errors.
  if (error) {
    const isWorkerMissing = error.message.includes("(404)");

    // Produce a custom error message when given a non-existing Service Worker url.
    // Suggest developers to check their setup.
    if (isWorkerMissing) {
      const scopeUrl = new URL(options?.scope || "/", location.href);

      throw new Error(
        `\
Failed to register a Service Worker for scope ('${scopeUrl.href}') with script ('${absoluteWorkerUrl}'): Service Worker script does not exist at the given path.

Did you forget to run "npx msw init <PUBLIC_DIR>"?

Learn more about creating the Service Worker script: https://mswjs.io/docs/cli/init`
      );
    }

    // Fallback error message for any other registration errors.
    throw new Error(
      `Failed to register the Service Worker:\n\n${error.message}`
    );
  }

  return instance;
};

export function getAbsoluteWorkerUrl(relativeUrl: string): string {
  return new URL(relativeUrl, location.origin).href;
}

type FindWorker = (scriptUrl: string, mockServiceWorkerUrl: string) => boolean;

export const getWorkerByRegistration = (
  registration: ServiceWorkerRegistration,
  absoluteWorkerUrl: string,
  findWorker: FindWorker
): ServiceWorker | null => {
  const allStates = [
    registration.active,
    registration.installing,
    registration.waiting,
  ];
  const existingStates = allStates.filter(Boolean) as ServiceWorker[];
  const mockWorker = existingStates.find((worker) => {
    return findWorker(worker.scriptURL, absoluteWorkerUrl);
  });

  return mockWorker || null;
};
