import { CrmWorkspace } from "@/components/admin/crm";
import { getCrmWorkspaceData } from "@/lib/crm/contacts";
import { requireUser } from "@/lib/current-user";

export async function SalonCrmView() {
  const user = await requireUser();
  const data = await getCrmWorkspaceData(user.businessId);

  return (
    <CrmWorkspace
      data={data}
      customerPlural="Clients"
      customerSingular="Client"
      chatBaseHref="/admin/salon/chat"
    />
  );
}
