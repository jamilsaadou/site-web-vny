import Link from "next/link";
import { MunicipalServices } from "@/components/municipal-services";
import { Reveal } from "@/components/reveal";
import { municipalServices, serviceCategories } from "@/lib/municipal-services";

function IndicatorIcon({ icon }: { icon: "categories" | "services" | "time" }) {
  const commonProps = {
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  if (icon === "categories") {
    return (
      <svg {...commonProps}>
        <path d="M3 7h8v4H3zM13 5h8v6h-8zM3 13h8v6H3zM13 15h8v4h-8z" />
      </svg>
    );
  }

  if (icon === "services") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 9h10M7 12h7M7 15h5" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function ServicesPortalPage() {
  const indicators = [
    { value: `${serviceCategories.length}`, label: "Catégories", icon: "categories" as const },
    { value: `${municipalServices.length}`, label: "Services disponibles", icon: "services" as const },
    { value: "24h - 10j", label: "Délais de traitement", icon: "time" as const },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Naneye Yarda Service</p>
          <h1 className="display-font mt-2 text-4xl font-extrabold sm:text-5xl">Portail des services municipaux</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            Retrouvez toutes les démarches administratives de la Ville de Niamey avec des pages dédiées par
            catégorie et par service.
          </p>

          <div className="mt-6 grid gap-3 sm:max-w-xl sm:grid-cols-3">
            {indicators.map((item) => (
              <div key={item.label} className="soft-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(19,136,74,0.1)] text-[var(--green-deep)]">
                    <IndicatorIcon icon={item.icon} />
                  </span>
                  <p className="text-2xl font-extrabold text-[var(--orange-strong)]">{item.value}</p>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <MunicipalServices />

        <Reveal className="mt-8">
          <Link href="/naneye-yarda" className="btn-ghost inline-flex px-6 py-3 text-sm">
            Retour à Naneye Yarda
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
