import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const usefulLinks = [
  { href: "/actualite", label: "Actualités municipales" },
  { href: "/centenaire", label: "Programme du centenaire" },
  { href: "/naneye-yarda/services", label: "Services municipaux" },
  { href: "/contact", label: "Contact mairie" },
];

const quickServices = [
  {
    href: "/naneye-yarda/services/transport-mobilite/titre-taxi-particulier",
    label: "Titre de taxi - particulier",
  },
  {
    href: "/naneye-yarda/services/maison-propriete/permis-construire-residentiel",
    label: "Permis de construire",
  },
  {
    href: "/naneye-yarda/services/citoyennete/acte-naissance-securise",
    label: "Acte de naissance sécurisé",
  },
  {
    href: "/naneye-yarda/services/environnement/abonnement-collecte-dechets",
    label: "Collecte des déchets",
  },
];

type Social = {
  name: string;
  href: string;
  icon: ReactNode;
};

const socials: Social[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/VilleDeNiamey",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13.2 21v-6.8h2.4l.4-2.9h-2.8V9.4c0-.9.4-1.4 1.3-1.4H16V5.5h-2c-2.5 0-3.7 1.4-3.7 3.7v2.1H8.2v2.9h2.1V21" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/villedeniamey",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4l16 16" />
        <path d="M20 4L4 20" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@VilleDeNiamey",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2.5" y="6" width="19" height="12" rx="3" />
        <path d="M10 9l5 3-5 3z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/22720000000",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 11.5a8.5 8.5 0 1 1-15.8 4.3L3 21l5.2-1.3A8.5 8.5 0 0 1 20 11.5Z" />
        <path d="M9.6 8.8c-.2.3-.5 1 0 2 .7 1.4 2 2.6 3.4 3.2 1 .4 1.6.1 1.9-.2.1-.1.3-.4.3-.7l-1.2-.5-.4.5c-.2.2-.4.2-.6.1-.6-.2-1.7-1.2-2-1.9-.1-.2-.1-.4.1-.6l.5-.4-.5-1.2c-.3 0-.6.1-.7.3Z" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-[var(--line)] bg-[rgba(19,136,74,0.04)] py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange-strong)]">Ville de Niamey</p>
            <h3 className="display-font mt-2 text-2xl font-extrabold text-[var(--green-deep)]">Portail municipal</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Hôtel de Ville de Niamey, Avenue de la Mairie, Commune I.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">Téléphone: +227 20 00 00 00</p>
            <p className="text-sm text-[var(--muted)]">Email: contact@villedeniamey.ne</p>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--green-deep)]">Liens utiles</h4>
            <ul className="mt-4 space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--muted)] transition hover:text-[var(--orange-strong)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--green-deep)]">Démarches rapides</h4>
            <ul className="mt-4 space-y-2">
              {quickServices.map((service) => (
                <li key={service.href}>
                  <Link href={service.href} className="text-sm text-[var(--muted)] transition hover:text-[var(--orange-strong)]">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--green-deep)]">Réseaux sociaux</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(19,136,74,0.22)] bg-white text-[var(--green-deep)] transition hover:border-[rgba(240,122,20,0.5)] hover:text-[var(--orange-strong)]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Suivez les annonces officielles et les alertes d&apos;information municipale.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <p className="sm:justify-self-start">© 2026 Ville de Niamey - Tous droits réservés.</p>

            <span className="inline-flex w-fit items-center gap-1.5 self-center rounded-full border border-[rgba(37,99,235,0.4)] bg-[rgba(37,99,235,0.11)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1f4fae]">
              <Image
                src="/qualite.png"
                alt="Certification ANSI"
                width={18}
                height={18}
                className="h-[18px] w-[18px] rounded-full object-cover"
                sizes="18px"
              />
              Par ANSI 
            </span>

            <p className="sm:justify-self-end">Mise à jour du portail: 05 mars 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
