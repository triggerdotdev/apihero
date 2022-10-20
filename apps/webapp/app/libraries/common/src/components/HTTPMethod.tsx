import type { HTTPMethod } from ".prisma/client";
import classNames from "classnames";

type HTTPMethodProps = {
  method: HTTPMethod;
  className?: string;
};

export function HTTPMethodLabel({ method, className }: HTTPMethodProps) {
  return (
    <span className={classNames(colorClassNameForMethod(method), className)}>
      {method}
    </span>
  );
}

export function colorClassNameForMethod(method: HTTPMethod): string {
  switch (method) {
    case "GET":
      return "text-green-500";
    case "HEAD":
      return "text-green-500";
    case "POST":
      return "text-blue-500";
    case "PUT":
      return "text-orange-500";
    case "PATCH":
      return "text-yellow-500";
    case "OPTIONS":
      return "text-gray-500";
    case "DELETE":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}
