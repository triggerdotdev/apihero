import type {
  ApiSchemaSecurityRequirement,
  ApiSchemaSecurityScheme,
} from ".prisma/client";
import { AuthenticationBadge } from "~/libraries/ui/src/components/client/AuthenticationBadge";

export type AuthenticationBadgeProps = {
  securityRequirements: Array<
    ApiSchemaSecurityRequirement & { securityScheme: ApiSchemaSecurityScheme }
  >;
};

export function AuthenticationBadges({
  securityRequirements,
}: AuthenticationBadgeProps) {
  const groupedByIdentifier = securityRequirements.reduce(
    (acc, requirement) => {
      const identifier = requirement.securityScheme.identifier;

      if (acc[identifier] == undefined) {
        acc[identifier] = [];
      }

      acc[identifier].push(requirement);

      return acc;
    },
    {} as Record<string, typeof securityRequirements>
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {Object.entries(groupedByIdentifier).map(([identifier, requirements]) => (
        <AuthenticationBadge
          key={identifier}
          name={requirements[0].securityScheme.title ?? identifier}
        />
      ))}
    </div>
  );
}
