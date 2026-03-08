import Link from "next/link";
import { getCategoryPath, getServicePath, municipalServices, serviceCategories } from "@/lib/municipal-services";
import { ServiceCategoryIcon } from "@/components/service-category-icon";

export function MunicipalServices() {
  return (
    <section id="services-municipaux" className="soft-card mt-12 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange-strong)]">
            Naneye Yarda Service
          </p>
          <h2 className="display-font mt-2 text-3xl font-extrabold text-[var(--green-deep)] sm:text-4xl">
            Portail des services municipaux de Niamey
          </h2>
        </div>
        <Link href="/naneye-yarda/services" className="btn-primary px-6 py-3 text-sm">
          Ouvrir le portail complet
        </Link>
      </div>

      <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--muted)] sm:text-base">
        Accédez aux démarches de la mairie: état civil, urbanisme, transport, environnement, jeunesse et
        action sociale. Chaque catégorie et chaque service disposent d&apos;une page dédiée.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {serviceCategories.map((category) => (
          <Link
            key={category.slug}
            href={getCategoryPath(category)}
            className="group rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[rgba(240,122,20,0.4)] hover:shadow-[0_18px_40px_rgba(15,37,26,0.15)]"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(19,136,74,0.1)] text-[var(--green-deep)] transition group-hover:bg-[rgba(240,122,20,0.15)] group-hover:text-[var(--orange-strong)]">
              <ServiceCategoryIcon icon={category.icon} />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-[var(--green-deep)]">{category.label}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{category.description}</p>
            <p className="mt-3 text-sm font-bold text-[var(--orange-strong)]">Consulter la catégorie →</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-extrabold text-[var(--green-deep)]">Services les plus consultés</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {municipalServices.slice(0, 6).map((service) => {
            const category = serviceCategories.find((item) => item.slug === service.categorySlug);

            return (
              <Link
                key={service.slug}
                href={getServicePath(service)}
                className="group flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[rgba(255,255,255,0.95)] px-4 py-3 transition hover:border-[rgba(19,136,74,0.35)] hover:bg-[rgba(19,136,74,0.05)]"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(19,136,74,0.1)] text-[var(--green-deep)] transition group-hover:bg-[rgba(240,122,20,0.14)] group-hover:text-[var(--orange-strong)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 12a9 9 0 1 0 2.6-6.3" />
                    <path d="M3 4v4h4" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                    {category?.label ?? "Service municipal"}
                  </p>
                  <h4 className="mt-1 truncate text-sm font-extrabold text-[var(--green-deep)] sm:text-base">
                    {service.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                    <span>Délai: {service.processingTime}</span>
                    <span>Tarif: {service.fee}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
