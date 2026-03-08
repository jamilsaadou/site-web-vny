import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { getLatestNews, searchNews, type SectionName } from "@/lib/news";
import { actualitePhotos } from "@/lib/media";
import { formatFrenchDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ActualitePageProps = {
  searchParams: Promise<{
    q?: string;
    section?: string;
  }>;
};

type SectionFilter = "all" | "actualite" | "naneye-yarda" | "centenaire";

const sectionLabelByFilter: Record<Exclude<SectionFilter, "all">, SectionName> = {
  actualite: "Actualité",
  "naneye-yarda": "Naneye Yarda",
  centenaire: "Le centenaire",
};

const sectionOptions: { value: SectionFilter; label: string }[] = [
  { value: "all", label: "Toutes les rubriques" },
  { value: "actualite", label: "Actualité" },
  { value: "naneye-yarda", label: "Naneye Yarda" },
  { value: "centenaire", label: "Le centenaire" },
];

function normalizeSectionFilter(value?: string): SectionFilter {
  if (value === "actualite" || value === "naneye-yarda" || value === "centenaire") {
    return value;
  }
  return "all";
}

export async function generateMetadata(): Promise<Metadata> {
  const news = await getLatestNews(1);
  const first = news[0];

  return {
    title: first?.seoTitle || "Actualité | Ville de Niamey",
    description:
      first?.seoDescription ||
      "Actualités officielles de la Ville de Niamey: annonces municipales, projets urbains et informations institutionnelles.",
    keywords: first?.seoKeywords || "actualité niamey, mairie, informations municipales",
  };
}

export default async function ActualitePage({ searchParams }: ActualitePageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const sectionFilter = normalizeSectionFilter(typeof params.section === "string" ? params.section : undefined);
  const selectedSection = sectionFilter === "all" ? undefined : sectionLabelByFilter[sectionFilter];
  const news = await searchNews({
    query,
    section: selectedSection,
    limit: 30,
  });
  const hasFilters = query.length > 0 || sectionFilter !== "all";
  const resultLabel = `${news.length} actualité${news.length > 1 ? "s" : ""}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">
            Actualité
          </p>
          <h1 className="display-font mt-2 text-4xl font-extrabold sm:text-5xl">Informations municipales</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            Retrouvez les annonces de la mairie, les avancées des projets urbains et les informations officielles
            concernant la vie de la capitale.
          </p>
        </Reveal>

        <Reveal className="mt-8">
          <form
            action="/actualite"
            method="get"
            className="soft-card grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_220px_auto_auto] sm:items-end"
          >
            <label className="space-y-2 text-sm font-semibold text-[var(--green-deep)]">
              Rechercher une actualité
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Ex: voirie, jeunesse, centenaire"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--orange)] focus:ring-2 focus:ring-[rgba(240,122,20,0.2)]"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[var(--green-deep)]">
              Rubrique
              <select
                name="section"
                defaultValue={sectionFilter}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--green)] focus:ring-2 focus:ring-[rgba(19,136,74,0.2)]"
              >
                {sectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="btn-primary px-5 py-3 text-sm">
              Rechercher
            </button>

            {hasFilters ? (
              <Link href="/actualite" className="btn-ghost px-5 py-3 text-sm text-center">
                Réinitialiser
              </Link>
            ) : null}
          </form>
        </Reveal>

        <Reveal className="mt-5">
          <p className="text-sm text-[var(--muted)]">
            {resultLabel}
            {query ? ` pour "${query}"` : ""}
            {selectedSection ? ` - ${selectedSection}` : ""}
          </p>
        </Reveal>

        {news.length === 0 ? (
          <Reveal className="mt-8">
            <div className="soft-card p-6">
              <p className="text-base font-semibold text-[var(--green-deep)]">Aucune actualité trouvée</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Modifiez les mots-clés ou la rubrique, puis relancez la recherche.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.06}>
                <Link href={`/actualite/${item.slug}`} className="soft-card block overflow-hidden transition hover:shadow-[0_22px_48px_rgba(14,38,27,0.2)]">
                  <div className="relative h-44">
                    <Image
                      src={item.featuredImage || actualitePhotos[index % actualitePhotos.length]}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="pill px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]">
                        {item.section}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{formatFrenchDate(item.publishedAt)}</span>
                    </div>

                    <h2 className="mt-4 text-xl leading-snug font-extrabold text-[var(--green-deep)]">{item.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.excerpt}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--orange-strong)]">
                      {item.location}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-10">
          <Link href="/contact" className="btn-primary inline-flex px-6 py-3 text-sm">
            Envoyer une information à la mairie
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
