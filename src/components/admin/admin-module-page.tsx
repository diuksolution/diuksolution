import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export function AdminModulePage({ title }: { title: string }) {
  return (
    <AdminPlaceholder
      title={title}
      description={`${title} is a module in this workspace. Add the page content here without changing the shared sidebar core.`}
    />
  );
}
