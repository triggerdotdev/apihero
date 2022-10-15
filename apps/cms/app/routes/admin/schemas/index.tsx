import { EmptyState } from "~/components/EmptyState";

export default function SchemasIndexRoute() {
  return (
    <div className="mt-12">
      <EmptyState
        title="API Schemas"
        subtitle="Get started by adding a new integration, or select a schema from the list"
        action="/admin/integrations/new"
        actionTitle="New Integration"
      />
    </div>
  );
}
