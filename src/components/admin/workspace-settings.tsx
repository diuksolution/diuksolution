import { BUSINESS_TYPE_LABELS } from "@/lib/business-type";
import { requireUser } from "@/lib/current-user";

export async function WorkspaceSettings() {
  const user = await requireUser();

  return (
    <section className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-on-surface">Settings</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Business settings will live here. The current workspace is already
        resolved from the signed-in user.
      </p>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-on-surface-variant">Business</dt>
          <dd className="font-medium text-on-surface">{user.business.name}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Business type</dt>
          <dd className="font-medium text-on-surface">
            {BUSINESS_TYPE_LABELS[user.business.businessType]}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Signed in as</dt>
          <dd className="font-medium text-on-surface">{user.name}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Auth provider</dt>
          <dd className="font-medium text-on-surface">{user.authProvider}</dd>
        </div>
      </dl>
    </section>
  );
}
