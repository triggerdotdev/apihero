import DocumentTextIcon from "@heroicons/react/solid/DocumentTextIcon";

type DocumentationIconProps = {
  onClick?: () => void;
  className?: string;
};

export function DocumentationIcon({
  onClick,
  className,
}: DocumentationIconProps) {
  return (
    <button
      onClick={onClick}
      className={`group rounded bg-black/5 p-1 transition hover:cursor-pointer hover:bg-blue-100 ${className}`}
    >
      <DocumentTextIcon className="w-5 text-gray-600 transition group-hover:text-blue-500" />
    </button>
  );
}
