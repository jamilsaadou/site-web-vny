import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { ServiceCategoryIcon } from "@/components/service-category-icon";
import {
  getCategoryBySlug,
  getCategoryPath,
  getServiceBySlugs,
  getServicePath,
  municipalServices,
} from "@/lib/municipal-services";

type ServicePageProps = {
  params: Promise<{ categorySlug: string; serviceSlug: string }>;
};

export function generateStaticParams() {
  return municipalServices.map((service) => ({
    categorySlug: service.categorySlug,
    serviceSlug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { categorySlug, serviceSlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const service = getServiceBySlugs(categorySlug, serviceSlug);

  if (!category || !service) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            <Link href="/naneye-yarda/services" className="hover:text-[var(--orange-strong)]">
              Naneye Yarda Service
            </Link>
            <span>/</span>
            <Link href={getCategoryPath(category)} className="hover:text-[var(--orange-strong)]">
              {category.label}
            </Link>
            <span>/</span>
            <span>{service.title}</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(19,136,74,0.12)] text-[var(--green-deep)]">
              <ServiceCategoryIcon icon={category.icon} className="h-9 w-9" />
            </div>
            <div>
              <h1 className="display-font text-4xl font-extrabold sm:text-5xl">{service.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                {service.summary}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="soft-card mt-8 p-6 sm:p-8">
          <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
            <p>
              <span className="font-bold text-[var(--green-deep)]">Délai de traitement:</span> {service.processingTime}
            </p>
            <p>
              <span className="font-bold text-[var(--green-deep)]">Tarif:</span> {service.fee}
            </p>
            <p>
              <span className="font-bold text-[var(--green-deep)]">Service responsable:</span> {service.office}
            </p>
            <p>
              <span className="font-bold text-[var(--green-deep)]">Contact:</span> {service.contact}
            </p>
          </div>

          <h2 className="mt-8 text-2xl font-extrabold text-[var(--green-deep)]">Les étapes</h2>
          <ol className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
            {service.steps.map((step, index) => (
              <li key={step}>
                <span className="font-bold text-[var(--green-deep)]">{index + 1}.</span> {step}
              </li>
            ))}
          </ol>

          <h2 className="mt-8 text-2xl font-extrabold text-[var(--green-deep)]">Informations utiles</h2>
          <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
            <p>
              <span className="font-bold text-[var(--green-deep)]">Démarche obligatoire:</span> {service.mandatory}
            </p>
            <p>
              <span className="font-bold text-[var(--green-deep)]">Durée de validité:</span> {service.validity}
            </p>
            <p>
              <span className="font-bold text-[var(--green-deep)]">Heures d&apos;ouverture:</span> {service.hours}
            </p>
          </div>

          <h2 className="mt-8 text-2xl font-extrabold text-[var(--green-deep)]">Documents requis</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
            {service.requiredDocs.map((doc) => (
              <li key={doc}>- {doc}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-8 flex flex-wrap gap-3">
          <Link href={getCategoryPath(category)} className="btn-ghost px-6 py-3 text-sm">
            Retour à {category.label}
          </Link>
          <Link href={getServicePath(service)} className="btn-primary px-6 py-3 text-sm">
            Recharger ce service
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
