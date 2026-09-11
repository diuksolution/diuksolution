import Image from "next/image";
import { landingPage } from "@/data/landing-page";

export function Footer() {
  const { footer, header } = landingPage;

  return (
    <footer className="w-full border-t border-outline-variant bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <Image
              src={header.logo.src}
              alt={header.logo.alt}
              width={112}
              height={28}
              unoptimized
              className="mb-3 h-7 w-auto object-contain"
            />
            <p className="mb-4 max-w-sm text-xs text-on-surface-variant">
              {footer.description}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 font-mono text-[11px] text-on-surface-variant">
              <span className="relative overflow-hidden rounded-sm border border-gray-300">
                <span className="block h-1.5 w-3.5 bg-red-600" />
                <span className="block h-1.5 w-3.5 bg-white" />
              </span>
              <span>{footer.badge}</span>
            </div>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 font-mono text-xs font-bold text-on-surface uppercase">
                {column.title}
              </h4>
              <ul className="space-y-2 text-xs text-on-surface-variant">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-on-surface">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-6 font-mono text-xs text-on-surface-variant sm:flex-row">
          <p>{footer.copyright}</p>
          <p>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
