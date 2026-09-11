type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  eyebrowClassName?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  eyebrowClassName = "text-primary-dark",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className ?? "mb-12"}`}
    >
      <span
        className={`mb-2 block font-mono text-xs font-bold uppercase tracking-wider ${eyebrowClassName}`}
      >
        {eyebrow}
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-base text-on-surface-variant">{description}</p>
      ) : null}
    </div>
  );
}
