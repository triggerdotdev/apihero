import { CheckCircleIcon } from "@heroicons/react/24/solid";

export type ApiLogoProps = {
  ApiLogo: string;
  isSupported?: boolean;
};

export function ApiLogoContainer({ ApiLogo, isSupported }: ApiLogoProps) {
  return (
    <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-md bg-white p-2 xl:bg-slate-100">
      {isSupported === true ? (
        <CheckCircleIcon className="absolute -top-2 -right-2 h-7 w-7 text-emerald-500"></CheckCircleIcon>
      ) : (
        <></>
      )}
      <img src={ApiLogo} alt="API logo" className="object-contain" />
    </div>
  );
}
