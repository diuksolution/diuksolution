export function AdminPageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 animate-pulse py-2">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-surface-container-high" />
          <div className="h-4 w-72 max-w-full rounded-md bg-surface-container" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-surface-container-high" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm"
          >
            <div className="h-3 w-20 rounded bg-surface-container-high" />
            <div className="mt-4 h-8 w-16 rounded bg-surface-container" />
            <div className="mt-3 h-3 w-28 rounded bg-surface-container-high" />
          </div>
        ))}
      </div>

      <div className="min-h-80 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
        <div className="mb-4 h-10 w-full max-w-md rounded-xl bg-surface-container-low" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl bg-surface-container-low/70 px-3 py-3"
            >
              <div className="size-10 shrink-0 rounded-full bg-surface-container-high" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-1/3 rounded bg-surface-container-high" />
                <div className="h-3 w-2/3 rounded bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}
