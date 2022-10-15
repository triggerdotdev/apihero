import { EmptyState } from "~/components/EmptyState";

export default function IntegrationsIndexRoute() {
  return (
    <div className="mt-12">
      <EmptyState
        title="Integrations"
        subtitle="Get started by adding a new integration"
        action="new"
        actionTitle="New Integration"
      />
    </div>
  );
}
