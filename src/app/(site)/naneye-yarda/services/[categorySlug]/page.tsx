import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { ServiceCategoryIcon } from "@/components/service-category-icon";
import {
  getCategoryBySlug,
  getCategoryPath,
  getServicePath,
  getServicesByCategory,
  serviceCategories,
} from "@/lib/municipal-services";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export function generateStaticParams() {
  return serviceCategories.map((category) => ({ categorySlug: category.slug }));
}

export default async function ServiceCategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const services = getServicesByCategory(category.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            <Link href="/naneye-yarda/services" className="hover:text-[var(--orange-strong)]">
              Naneye Yarda Service
            </Link>
            <span>/</span>
            <span>{category.label}</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(19,136,74,0.12)] text-[var(--green-deep)]">
              <ServiceCategoryIcon icon={category.icon} className="h-9 w-9" />
            </div>
            <div>
              <h1 className="display-font text-4xl font-extrabold sm:text-5xl">{category.label}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                {category.description}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.06} className="soft-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--orange-strong)]">
                Délai: {service.processingTime}
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-[var(--green-deep)]">{service.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{service.summary}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                Tarif: {service.fee}
              </p>
              <Link
                href={getServicePath(service)}
                className="mt-4 inline-flex rounded-lg border border-[rgba(240,122,20,0.35)] bg-[rgba(240,122,20,0.12)] px-4 py-2 text-sm font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
              >
                Voir la page du service
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-wrap gap-3">
          <Link href="/naneye-yarda/services" className="btn-ghost px-6 py-3 text-sm">
            Toutes les catégories
          </Link>
          <Link href={getCategoryPath(category)} className="btn-primary px-6 py-3 text-sm">
            Actualiser cette catégorie
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
