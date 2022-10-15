import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useSubmit,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import clsx from "clsx";
import { useCallback, useRef, useState } from "react";
import invariant from "tiny-invariant";
import {
  bulkEditSecurityRequirements,
  findOperationsBySchemaIdForBulkOperations,
  findSecuritySchemeById,
} from "~/models/apiSchema.server";
import { useHotkeys } from "react-hotkeys-hook";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { classNamesForTagName } from "~/components/tags";
import { marked } from "marked";
import jsonQuery from "json-query";
import {
  commitSession,
  getSession,
  setErrorMessage,
  setSuccessMessage,
} from "~/models/message.server";
import { SecondaryButton } from "~/libraries/common";

type LoaderData = {
  securityScheme: Awaited<ReturnType<typeof findSecuritySchemeById>>;
  operations: Awaited<
    ReturnType<typeof findOperationsBySchemaIdForBulkOperations>
  >;
  operationIds: string[];
  scopeOptions?: Array<{ name: string; description: string; id: string }>;
  url: string;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const { securitySchemeId, id } = params;

  invariant(id, "id is required");
  invariant(securitySchemeId, "securitySchemeId is required");

  const securityScheme = await findSecuritySchemeById(securitySchemeId);

  const operationIds =
    securityScheme?.securityRequirements
      ?.filter((sr) => sr.operationId)
      .map((sr) => sr.operationId as string) ?? [];

  const url = new URL(request.url);

  const operations = await getAllOperationsForSchema(id, url.searchParams);

  const scopeOptions = createScopeOptionsFromScheme(securityScheme);

  const data: LoaderData = {
    securityScheme,
    operations,
    operationIds,
    scopeOptions,
    url: request.url,
  };

  return data;
};

function createScopeOptionsFromScheme(
  scheme: LoaderData["securityScheme"]
): Array<{ name: string; description: string; id: string }> | undefined {
  if (!scheme || scheme.scopes.length === 0) {
    return;
  }

  return scheme.scopes.map((scope) => ({
    name: scope.name,
    description: scope.description,
    id: scope.id,
  }));
}

function scopesForOperationAndScheme(
  operation: LoaderData["operations"][0],
  scheme: LoaderData["securityScheme"]
) {
  if (!operation || !scheme) {
    return [];
  }

  const securityRequirements = operation.securityRequirements.filter(
    (sr) => sr.securitySchemeId === scheme.id
  );

  if (securityRequirements.length === 0) {
    return [];
  }

  return securityRequirements.flatMap(
    (sr) => sr.scopes.map((scope) => scope.id) ?? []
  );
}

function calculateRequireAllForOperationAndScheme(
  operation: LoaderData["operations"][0],
  scheme: LoaderData["securityScheme"]
) {
  if (!operation || !scheme) {
    return false;
  }

  const securityRequirements = operation.securityRequirements.filter(
    (sr) => sr.securitySchemeId === scheme.id
  );

  return securityRequirements.length === 1;
}

function getScopesFromFormData(form: FormData) {
  const allEntries = Array.from(form.entries());
  const scopeEntries = allEntries.filter(([key]) =>
    key.match(/^scopes-([a-zA-Z0-9]+)\[\d+\]\[id\]$/)
  );

  return scopeEntries.reduce((acc, [key, value]) => {
    const [, operationId] = key.match(/^scopes-([a-zA-Z0-9]+)\[\d+\]\[id\]$/)!;
    acc[operationId] = acc[operationId] ?? { scopes: [], requireAll: false };
    acc[operationId].scopes.push(value as string);

    const requireAllRaw = form.get(`scopes-${operationId}-requireAll`);

    if (typeof requireAllRaw === "string") {
      acc[operationId].requireAll = requireAllRaw === "on";
    } else {
      acc[operationId].requireAll = false;
    }

    return acc;
  }, {} as Record<string, { scopes: string[]; requireAll: boolean }>);
}

export const action: ActionFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("cookie"));
  const { securitySchemeId, id } = params;

  invariant(id, "id is required");
  invariant(securitySchemeId, "securitySchemeId is required");

  const body = await request.formData();

  const operationIds = body.getAll("operationIds") as string[];
  const operationScopes = getScopesFromFormData(body);

  const url = new URL(request.url);

  const operations = await getAllOperationsForSchema(id, url.searchParams);

  try {
    await bulkEditSecurityRequirements(
      id,
      operations,
      securitySchemeId,
      operationIds,
      operationScopes,
    );

    setSuccessMessage(session, "Saved security requirements");
  } catch (error) {
    setErrorMessage(
      session,
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  return json(
    {},
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

async function getAllOperationsForSchema(
  schemaId: string,
  searchParams: URLSearchParams
) {
  let operations = await findOperationsBySchemaIdForBulkOperations(schemaId);

  if (searchParams.has("sortBy")) {
    if (searchParams.get("sortBy") === "tags") {
      operations = operations.sort((a, b) =>
        a.tags[0].name.localeCompare(b.tags[0].name)
      );
    }
  }

  if (searchParams.has("query")) {
    const query = searchParams.get("query") as string;

    operations = operations.filter((operation) => {
      const result = jsonQuery(query, { data: operation.extensions ?? {} });

      return result.value;
    });
  }

  if (searchParams.has("tag")) {
    const query = searchParams.get("tag") as string;

    operations = operations.filter((operation) => {
      return operation.tags.some((tag) => tag.name === query);
    });
  }

  if (searchParams.has("search")) {
    const query = searchParams.get("search") as string;
    if (query.trim() === "") {
      return operations;
    }

    const regex = new RegExp(query, 'gi');

    operations = operations.filter(operation => {
      if (operation.description == null) return false;
      const matches = [...operation.description.matchAll(regex)];
      return matches.length > 0;
    }).map((operation) => {
      if (operation.description != null) {
        const description = operation.description.replace(regex, "<mark>$&</mark>");
        return {
          ...operation,
          description,
        }
      }

      return operation;
    });
  }

  return operations;
}

export default function SecuritySchemeDetailsPage() {
  const { securityScheme, operations, operationIds, scopeOptions, url } =
    useLoaderData<LoaderData>();

  if (!securityScheme) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-medium">{securityScheme.identifier}</h2>
      <p className="text-gray-500">
        Used by{" "}
        {
          securityScheme.securityRequirements.filter((sr) => sr.operation)
            .length
        }{" "}
        operation(s)
      </p>
      {securityScheme.description && (
        <div
          className="prose mt-6 max-w-none px-4 sm:px-0"
          dangerouslySetInnerHTML={{
            __html: marked(securityScheme.description),
          }}
        />
      )}

      <SelectOperationsFieldset
        operations={operations}
        operationIds={operationIds}
        scopeOptions={scopeOptions}
        securityScheme={securityScheme}
        url={url}
      />
    </div>
  );
}

function SelectOperationsFieldset({
  operations,
  operationIds,
  scopeOptions,
  securityScheme,
  url
}: {
  operations: LoaderData["operations"];
  operationIds: LoaderData["operationIds"];
  scopeOptions: LoaderData["scopeOptions"];
  securityScheme: LoaderData["securityScheme"];
  url: string;
}) {
  const [selectedOperationIds, setSelectedOperationIds] =
    useState(operationIds);

  const checkboxRefs = useRef<HTMLInputElement[]>([]);

  const onChange = useCallback(
    (operationId) => {
      if (selectedOperationIds.includes(operationId)) {
        setSelectedOperationIds(
          selectedOperationIds.filter((id) => id !== operationId)
        );
      } else {
        setSelectedOperationIds(
          Array.from(new Set([...selectedOperationIds, operationId]))
        );
      }
    },
    [selectedOperationIds, setSelectedOperationIds]
  );

  const onSelectAll = useCallback(() => {
    checkboxRefs.current.forEach((element) => {
      element.checked = true;
    });
    setSelectedOperationIds(operations.map((operation) => operation.id));
  }, [setSelectedOperationIds, operations]);

  const formRef = useRef<HTMLFormElement>(null);

  const submit = useSubmit();

  // call onSave when the cmd/ctrl + s key is pressed
  useHotkeys(
    "cmd+s",
    (e) => {
      e.preventDefault();
      submit(formRef.current, { replace: false });
    },
    [submit]
  );

  const [bulkScopes, setBulkScopes] = useState<NonNullable<LoaderData["scopeOptions"]>>([]);

  return (
    <div>
      <div className="mt-12 flex justify-between items-center">
        <Form method="get" reloadDocument>
          <fieldset className="w-full">
            <div className="flex gap-2 items-end">
              <div className="sm:col-span-6">
                <label
                  htmlFor="tag"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tag
                </label>
                <div className="mt-1">
                  <input
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    type="text"
                    name="tag"
                    id="tag"
                    defaultValue={new URL(url).searchParams.get("tag") ?? ""}
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700"
                >
                  Search
                </label>
                <div className="mt-1">
                  <input
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    type="text"
                    name="search"
                    id="search"
                    defaultValue={new URL(url).searchParams.get("search") ?? ""}
                  />
                </div>
              </div>
              <SecondaryButton type="submit">Search</SecondaryButton>
            </div>
          </fieldset>
        </Form>

        {scopeOptions && (
          <div className="mr-6 flex gap-2 items-center">
            <label htmlFor="bulkScopes">Press button to add these scopes: </label>
            <div className="w-96">
              <ScopeDropdown name={"test"} selected={bulkScopes} setSelected={setBulkScopes} scopes={scopeOptions} />
            </div>
          </div>
        )}

      </div>
      <Form reloadDocument method="post" ref={formRef}>
        <fieldset className="mt-12 w-full">
          <legend className="text-lg font-medium text-gray-900">
            Bulk edit security requirements ({operations.length}){" "}
            <button
              type="button"
              className="ml-2 font-light text-gray-600 underline underline-offset-2"
              onClick={onSelectAll}
            >
              Select all
            </button>
          </legend>
          <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
            {operations.map((operation) => (
              <div key={operation.id} className="flex">
                <div className="relative flex-col items-start py-4 flex-grow">
                  <div className="min-w-0 flex-1 text-sm">
                    <label
                      htmlFor={`operation-${operation.id}`}
                      className="select-none"
                    >
                      <Link
                        to={`/admin/operations/${operation.id}`}
                        className="break-all text-sm font-medium text-gray-700"
                        target="_blank"
                      >
                        {operation.method} {operation.path.path}
                      </Link>

                      <span className="ml-2 break-all text-sm text-gray-500">
                        {operation.operationId}
                      </span>

                      {operation.tags.map((tag) => (
                        <span
                          key={tag.name}
                          className={clsx(
                            "ml-2 inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5",
                            classNamesForTagName(tag.name)
                          )}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </label>
                  </div>
                  {operation.description && (
                    <div className="prose mt-2 max-w-none px-4 sm:px-0">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: marked(operation.description),
                        }}
                      ></span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex items-start">
                  <SetOperationSecurity
                    operation={operation}
                    securityScheme={securityScheme}
                    onChange={onChange}
                    selectedOperationIds={selectedOperationIds}
                    checkboxRefs={checkboxRefs}
                    bulkScopes={bulkScopes}
                    operationIds={operationIds}
                    scopeOptions={scopeOptions}
                  />
                </div>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}

function SetOperationSecurity({ selectedOperationIds, operation, scopeOptions, securityScheme, bulkScopes, operationIds, onChange, checkboxRefs }:
  {
    selectedOperationIds: string[];
    operationIds: string[];
    bulkScopes: NonNullable<LoaderData["scopeOptions"]>;
    operation: LoaderData["operations"]["0"];
    scopeOptions: LoaderData["scopeOptions"];
    securityScheme: LoaderData["securityScheme"];
    onChange: (operationId: string) => void;
    checkboxRefs: React.MutableRefObject<HTMLInputElement[]>;
  }
) {
  const localInputRef = useRef<HTMLInputElement>();
  const scopesForOpScheme = scopesForOperationAndScheme(
    operation,
    securityScheme
  )
  const [selected, setSelected] = useState(
    scopeOptions?.filter((scopeOptions) => scopesForOpScheme.includes(scopeOptions.id)) ?? []
  );

  return (
    <div className="flex mt-4">
      {bulkScopes.length > 0 && (
        <SecondaryButton
          onClick={(e) => {
            const setOfIds = new Set(selected.map((s) => s.id));
            for (const scope of bulkScopes) {
              setOfIds.add(scope.id);
            }
            setSelected(scopeOptions?.filter((s) => setOfIds.has(s.id)) ?? []);
            if (localInputRef.current) {
              if (!localInputRef.current.checked) {
                onChange(operation.id);
                localInputRef.current.checked = true;
              }
            }
            e.preventDefault();
          }}
          className="flex-shrink-0 mr-1 max-h-10 self-end"
        >
          Add {bulkScopes.map(s => s.name).join(", ")}
        </SecondaryButton>
      )}
      <div className="flex flex-grow">
        {selectedOperationIds.includes(operation.id) && (
          <>
            {scopeOptions && (
              <div className="mr-6 w-96">
                <RequirementScopesSelect
                  scopes={scopeOptions}
                  requireAll={calculateRequireAllForOperationAndScheme(
                    operation,
                    securityScheme
                  )}
                  selected={selected}
                  setSelected={setSelected}
                  name={`scopes-${operation.id}`}
                />
              </div>
            )}
          </>
        )}

        <input
          id={`operation-${operation.id}`}
          name="operationIds"
          defaultValue={operation.id}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          defaultChecked={operationIds.includes(operation.id)}
          onChange={(e) => {
            onChange(operation.id);
          }}
          ref={(ref) => {
            if (ref) { checkboxRefs.current.push(ref); localInputRef.current = ref; }
          }}
        />
      </div>
    </div>
  )
}

function RequirementScopesSelect({
  scopes,
  requireAll,
  selected,
  name,
  setSelected
}: {
  scopes: Array<{ name: string; description: string; id: string }>;
  requireAll: boolean;
  name: string;
  selected: NonNullable<LoaderData["scopeOptions"]>;
  setSelected: (selected: {
    name: string;
    description: string;
    id: string;
  }[]) => void
}) {

  return (
    <div className="">
      {selected.length > 1 && (
        <div className="mb-2">
          <label
            htmlFor={`${name}-exclusive`}
            className="mr-3 text-sm text-gray-500"
          >
            Require all?
          </label>
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            name={`${name}-requireAll`}
            defaultChecked={requireAll}
          />
        </div>
      )}
      <div>
        <ScopeDropdown name={name} selected={selected} setSelected={setSelected} scopes={scopes} />
      </div>
    </div >
  );
}

function ScopeDropdown({ name, selected, setSelected, scopes }: {
  name: string, selected: { name: string; description: string; id: string; }[], setSelected: (selected: {
    name: string;
    description: string;
    id: string;
  }[]) => void, scopes: { name: string; description: string; id: string; }[]
}) {
  return <Listbox
    name={name}
    multiple={true}
    value={selected}
    onChange={setSelected}
  >
    {({ open }) => (
      <>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
            <span className="inline-flex w-full truncate">
              <span className="truncate">
                {selected.length > 0 ? (
                  <>{selected.map((r) => r.name).join(", ")}</>
                ) : (
                  "Select scopes"
                )}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <SelectorIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {[...scopes].sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                  return -1;
                }
                if (nameA > nameB) {
                  return 1;
                }
                return 0;
              }).map((scope) => (
                <Listbox.Option
                  key={scope.name}
                  className={({ active }) => clsx(
                    active ? "bg-indigo-600 text-white" : "text-gray-900",
                    "relative cursor-default select-none py-2 pl-3 pr-9"
                  )}
                  value={scope}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex">
                        <span
                          className={clsx(
                            selected ? "font-semibold" : "font-normal",
                            "truncate"
                          )}
                        >
                          {scope.name}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={clsx(
                            active ? "text-white" : "text-indigo-600",
                            "absolute inset-y-0 right-0 flex items-center pr-4"
                          )}
                        >
                          <CheckIcon
                            className="h-5 w-5"
                            aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </>
    )}
  </Listbox>;
}

