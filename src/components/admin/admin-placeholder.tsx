export function AdminPlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-outline-variant bg-white p-8 shadow-sm">
      <p className="font-mono text-[11px] tracking-wider text-primary uppercase">
        Coming next
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-on-surface">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
        {description ??
          "This module shares the appointment workspace shell. Wire data here without changing navigation or auth."}
      </p>
    </section>
  );
}
