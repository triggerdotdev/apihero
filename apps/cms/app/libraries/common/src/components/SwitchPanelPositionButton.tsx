import { SwitchPanelMenuIcon } from "~/libraries/ui/src/components/Icons/SwitchPanelMenuIcon";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { SwitchPanelIconBottom } from "~/libraries/ui/src/components/Icons/SwitchPanelIconBottom";
import { SwitchPanelIconRight } from "~/libraries/ui/src/components/Icons/SwitchPanelIconRight";
import type { PanelPosition } from "../hooks/usePanelPosition";
import { SwitchPanelIconLeft } from "~/libraries/ui/src/components/Icons/SwitchPanelIconLeft";
import { SwitchPanelIconTop } from "~/libraries/ui/src/components/Icons/SwitchPanelIconTop";
import { CheckIcon } from "@heroicons/react/solid";

type SwitchPanelPositionButtonProps = {
  options: PanelPosition[];
  position: PanelPosition;
  setPosition: (position: PanelPosition) => void;
  className?: string;
};

export function SwitchPanelPositionButton({
  position,
  setPosition,
  className,
  options,
}: SwitchPanelPositionButtonProps) {
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button
          className={`group flex h-[30px] w-[30px] max-w-xs items-center justify-center rounded-md border border-transparent bg-transparent text-sm transition hover:border-slate-200 hover:bg-white ${className}`}
        >
          <SwitchPanelMenuIcon
            className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-slate-500"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-2 z-50 mt-1 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-2">
            {options.includes("top") && (
              <ToggleItem
                icon={SwitchPanelIconTop}
                label={"Pin top"}
                selected={position === "top"}
                onClick={() => setPosition("top")}
              />
            )}
            {options.includes("bottom") && (
              <ToggleItem
                icon={SwitchPanelIconBottom}
                label={"Pin bottom"}
                selected={position === "bottom"}
                onClick={() => setPosition("bottom")}
              />
            )}
            {options.includes("right") && (
              <ToggleItem
                icon={SwitchPanelIconRight}
                label={"Pin right"}
                selected={position === "right"}
                onClick={() => setPosition("right")}
              />
            )}
            {options.includes("left") && (
              <ToggleItem
                icon={SwitchPanelIconLeft}
                label={"Pin left"}
                selected={position === "left"}
                onClick={() => setPosition("left")}
              />
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

type ToggleItemProps = {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  selected: boolean;
  onClick: () => void;
};

function ToggleItem(props: ToggleItemProps) {
  return (
    <Menu.Item>
      <button
        onClick={props.onClick}
        className={classNames(
          props.selected ? "text-slate-800" : "text-gray-700",
          "group flex w-full items-center justify-items-start rounded-md px-3 py-2 text-sm hover:bg-slate-100 hover:text-slate-800"
        )}
      >
        <div className="flex w-full items-center">
          <props.icon
            className="mr-2 h-4 w-4 text-slate-500 transition group-hover:text-blue-500"
            aria-hidden="true"
          />
          <span className="w-full whitespace-nowrap text-left">
            {props.label}
          </span>
          <CheckIcon
            className={classNames(
              props.selected ? "text-blue-500" : "text-transparent",
              "h-6 w-6"
            )}
            aria-hidden="true"
          />
        </div>
      </button>
    </Menu.Item>
  );
}
