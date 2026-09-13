import { WhatsAppConnectionCard } from "@/components/admin/settings/whatsapp-connection-card";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-type";
import { requireUser } from "@/lib/current-user";
import { getBusinessWhatsAppConnection } from "@/lib/whatsapp/credentials";

export async function WorkspaceSettings() {
  const user = await requireUser();
  const whatsapp = await getBusinessWhatsAppConnection(user.businessId);

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
          Settings
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Profil workspace dan integrasi per bisnis.
        </p>
      </div>

      <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-on-surface">Workspace</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-on-surface-variant">Business</dt>
            <dd className="mt-1 font-medium text-on-surface">
              {user.business.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Business type</dt>
            <dd className="mt-1 font-medium text-on-surface">
              {BUSINESS_TYPE_LABELS[user.business.businessType]}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Signed in as</dt>
            <dd className="mt-1 font-medium text-on-surface">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Auth provider</dt>
            <dd className="mt-1 font-medium text-on-surface">
              {user.authProvider}
            </dd>
          </div>
        </dl>
      </section>

      <WhatsAppConnectionCard initial={whatsapp} />
    </div>
  );
}
