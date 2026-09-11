import { landingPage } from "@/data/landing-page";
import { SectionHeading } from "@/components/landing/section-heading";

export function Workflow() {
  const { workflow } = landingPage;

  return (
    <section
      id={workflow.id}
      className="w-full border-y border-outline-variant bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={workflow.eyebrow}
          title={workflow.title}
          description={workflow.description}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {workflow.steps.map((step) => (
            <div
              key={step.step}
              className={`flex flex-col justify-between rounded-xl p-4 ${
                step.highlight
                  ? "bg-primary text-white shadow-xs"
                  : "border border-outline-variant bg-surface-container-low"
              }`}
            >
              <div>
                <span
                  className={`mb-2 block font-mono text-[10px] font-bold ${
                    step.highlight ? "text-primary-light" : "text-primary-dark"
                  }`}
                >
                  {step.step}
                </span>
                <div
                  className={`mb-3 space-y-1 rounded-lg border p-2.5 font-mono text-[11px] shadow-xs ${
                    step.highlight
                      ? "border-primary-light/40 bg-primary-dark/50"
                      : "border-outline-variant bg-white text-xs shadow-xs"
                  }`}
                >
                  {step.lines.map((line) => (
                    <WorkflowLine
                      key={line.text}
                      kind={line.kind}
                      text={line.text}
                      highlight={step.highlight}
                    />
                  ))}
                </div>
              </div>
              <p
                className={`text-xs font-semibold ${
                  step.highlight ? "text-white" : "text-on-surface"
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowLine({
  kind,
  text,
  highlight,
}: {
  kind: string;
  text: string;
  highlight: boolean;
}) {
  if (kind === "meta") {
    return (
      <div
        className={
          highlight
            ? "text-[10px] text-primary-light"
            : "mb-1 block font-mono text-[9px] text-gray-400"
        }
      >
        {text}
      </div>
    );
  }

  if (kind === "success") {
    return <div className="font-bold text-success">{text}</div>;
  }

  if (kind === "strong") {
    return (
      <div className={highlight ? "font-bold text-primary-light" : "font-bold text-on-surface"}>
        {text}
      </div>
    );
  }

  if (kind === "chip") {
    return (
      <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary-dark">
        {text}
      </span>
    );
  }

  if (kind === "chip-success") {
    return (
      <span className="inline-block rounded bg-success/15 px-1.5 py-0.5 text-[9px] text-success">
        {text}
      </span>
    );
  }

  if (kind === "chip-invert") {
    return (
      <span className="inline-block rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-primary-dark">
        {text}
      </span>
    );
  }

  return <div className={highlight ? "text-[10px] text-primary-light" : "text-on-surface"}>{text}</div>;
}
