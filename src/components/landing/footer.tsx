import Image from "next/image";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { buildWhatsAppUrl } from "@/lib/landing/whatsapp";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 6.045L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Footer() {
  const { footer, header, contact } = landingPage;

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
            <div className="mb-4 space-y-2 text-xs text-on-surface-variant">
              <a
                href={buildWhatsAppUrl(
                  "Halo DIUK, saya ingin bertanya tentang DIUK Solution.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-on-surface"
              >
                <WhatsAppIcon className="size-3.5 shrink-0 text-primary-dark" />
                <span>{contact.whatsapp.display}</span>
              </a>
              <a
                href={contact.email.href}
                className="flex items-center gap-2 hover:text-on-surface"
              >
                <Icon name="mail" className="text-[15px] text-primary-dark" />
                <span>{contact.email.display}</span>
              </a>
            </div>
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
