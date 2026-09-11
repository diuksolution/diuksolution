import { CrmWorkspace } from "@/components/admin/crm";
import { getCrmWorkspaceData } from "@/lib/crm/contacts";
import { requireUser } from "@/lib/current-user";

export async function ClinicCrmView() {
  const user = await requireUser();
  const data = await getCrmWorkspaceData(user.businessId);

  return (
    <CrmWorkspace
      data={data}
      customerPlural="Patients"
      customerSingular="Patient"
      chatBaseHref="/admin/clinic/chat"
    />
  );
}
