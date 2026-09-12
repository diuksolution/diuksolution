"use client";

import { motion } from "framer-motion";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/motion";

export function Workflow() {
  const { workflow } = landingPage;

  return (
    <section
      id={workflow.id}
      className="relative w-full overflow-hidden border-y border-outline-variant bg-background py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(134,187,81,0.14), transparent 34%), radial-gradient(circle at 85% 80%, rgba(45,52,120,0.1), transparent 32%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={workflow.eyebrow}
            title={workflow.title}
            description={workflow.description}
            className="mb-0 max-w-2xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="inline-flex items-center gap-2 self-start rounded-full border border-primary/25 bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-primary-dark shadow-xs lg:self-auto"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live pipeline · 5 nodes
          </motion.div>
        </div>

        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-3">
          {workflow.steps.map((step, index) => (
            <StaggerItem key={step.step} className="relative h-full">
              <WorkflowCard step={step} index={index} />
              {index < workflow.steps.length - 1 ? (
                <div className="pointer-events-none absolute top-[42%] -right-2 z-20 hidden -translate-y-1/2 md:block lg:-right-2.5">
                  <PipelineConnector />
                </div>
              ) : null}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function PipelineConnector() {
  return (
    <div className="flex items-center">
      <motion.span
        className="h-px w-3 bg-linear-to-r from-primary/40 to-primary"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      <motion.span
        className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-white text-primary shadow-xs"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.28 }}
      >
        <Icon name="arrow_forward" className="text-[12px]" />
      </motion.span>
    </div>
  );
}

function WorkflowCard({
  step,
  index,
}: {
  step: (typeof landingPage.workflow.steps)[number];
  index: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl p-4 ${
        step.highlight
          ? "border border-primary/40 bg-linear-to-br from-primary via-primary to-primary-dark text-white shadow-[0_22px_50px_-24px_rgba(101,147,58,0.85)]"
          : "border border-outline-variant bg-white shadow-sm"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-3 -top-3 font-mono text-6xl font-bold opacity-[0.07] ${
          step.highlight ? "text-white" : "text-secondary"
        }`}
      >
        {step.step}
      </div>

      {step.highlight ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.28),transparent_42%)]"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
              step.highlight
                ? "bg-white/15 text-primary-light"
                : "bg-secondary/10 text-secondary"
            }`}
          >
            {step.step} / {step.stage}
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              step.highlight
                ? "bg-white/15 text-white"
                : "bg-primary/10 text-primary-dark"
            }`}
          >
            <Icon name={step.icon} className="text-lg" />
          </span>
        </div>

        <div
          className={`mb-4 space-y-1.5 rounded-xl border p-3 font-mono text-[11px] ${
            step.highlight
              ? "border-white/20 bg-primary-dark/35 shadow-inner"
              : "border-outline-variant bg-surface-container-low/80"
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

      <div className="relative z-10">
        <p
          className={`text-sm font-bold tracking-tight ${
            step.highlight ? "text-white" : "text-on-surface"
          }`}
        >
          {step.label}
        </p>
        <p
          className={`mt-1 font-mono text-[10px] ${
            step.highlight ? "text-primary-light" : "text-on-surface-variant"
          }`}
        >
          Node {index + 1} of {landingPage.workflow.steps.length}
        </p>
      </div>
    </motion.div>
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
            : "font-mono text-[9px] text-gray-400"
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
      <div
        className={
          highlight ? "font-bold text-primary-light" : "font-bold text-on-surface"
        }
      >
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

  return (
    <div
      className={
        highlight ? "text-[10px] leading-relaxed text-primary-light" : "text-on-surface"
      }
    >
      {text}
    </div>
  );
}
