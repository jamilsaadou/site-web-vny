import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventCountdown } from "@/components/event-countdown";
import { HomeCarousel } from "@/components/home-carousel";
import { Reveal } from "@/components/reveal";
import { getHomepageData, getHomepageMetadata } from "@/lib/homepage";
import { getLatestNews } from "@/lib/news";
import { actualitePhotos } from "@/lib/media";
import { formatFrenchDate, isUploadedAssetPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getHomepageMetadata();
}

type ImpactIconName = "road" | "light" | "document" | "recycle" | "users" | "shield";

type ImpactFigure = {
  icon: ImpactIconName;
  value: string;
  title: string;
  detail: string;
};

const impactFigures: ImpactFigure[] = [
  {
    icon: "road",
    value: "37 km",
    title: "Voiries réhabilitées en 2025",
    detail: "Axes structurants traités dans les 5 arrondissements.",
  },
  {
    icon: "light",
    value: "12 400",
    title: "Luminaires LED modernisés",
    detail: "Renforcement progressif de l'éclairage public nocturne.",
  },
  {
    icon: "document",
    value: "18 250",
    title: "Actes d'état civil délivrés",
    detail: "Naissance, mariage et documents administratifs sécurisés.",
  },
  {
    icon: "recycle",
    value: "145",
    title: "Points de collecte actifs",
    detail: "Réseau municipal de pré-collecte des déchets ménagers.",
  },
  {
    icon: "users",
    value: "2 300",
    title: "Jeunes mobilisés",
    detail: "Programmes civiques et opérations Naneye Yarda en 2025.",
  },
  {
    icon: "shield",
    value: "86%",
    title: "Couverture salubrité zone centrale",
    detail: "Tournées hebdomadaires de collecte et de curage renforcées.",
  },
];

const featuredEvent = {
  title: "Journée de salubrité publique",
  edition: "23ème édition",
  targetDate: "2026-03-29T08:00:00+01:00",
  location: "Grandes artères et secteurs de nettoyage des 5 arrondissements de Niamey",
  message: "La Propreté de la Capitale C'est l'Affaire de Tous",
  callout: "Mobilisons-nous pour la salubrité et le désencombrement de nos grandes artères.",
  sectors: [
    "ACN 1 : Rond-point Sikiyé - Rond-point Gadafawa - Rond-point cimetière - Koubia poste.",
    "ACN 2 : Rond-point Sikiyé - Échangeur Mali Bero - Rond-point Francophonie - Koira Tegui.",
    "ACN 3 : STM-Bonkaney - Rond-point Kokorobado.",
    "ACN 4 : Rond-point 6ème - route Aéroport.",
    "ACN 5 : Rond-point Liptako - Say Tessam - Rond-point Saguia - route Say.",
  ],
};

function ImpactIcon({ icon }: { icon: ImpactIconName }) {
  const commonProps = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (icon) {
    case "road":
      return (
        <svg {...commonProps}>
          <path d="M9 3l-2 18M15 3l2 18" />
          <path d="M11.5 7h1M11 12h2M10.5 17h3" />
        </svg>
      );
    case "light":
      return (
        <svg {...commonProps}>
          <path d="M9 18h6M10 21h4" />
          <path d="M8 10a4 4 0 1 1 8 0c0 1.7-.8 2.8-1.7 3.8-.5.6-.8 1.2-.8 2.2h-3c0-1-.3-1.6-.8-2.2C8.8 12.8 8 11.7 8 10z" />
        </svg>
      );
    case "document":
      return (
        <svg {...commonProps}>
          <path d="M7 3h7l4 4v14H7z" />
          <path d="M14 3v4h4M10 12h6M10 16h6" />
        </svg>
      );
    case "recycle":
      return (
        <svg {...commonProps}>
          <path d="M8 7l2-3 2 3M16 10l3 1.5-1 3M9 17l-2.5 2-2-2.5" />
          <path d="M10 4h4l2 3M19 11l-2 4h-4M6.5 19L5 16l2-3" />
        </svg>
      );
    case "users":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="16" cy="9" r="2" />
          <path d="M4.5 18a4.5 4.5 0 0 1 9 0M13 18a3.5 3.5 0 0 1 7 0" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
  }
}

export default async function Home() {
  const homepageData = await getHomepageData();
  const latestNews = await getLatestNews(6);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <Reveal className="space-y-6">
          <span className="pill inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-[0.14em]">
            {homepageData.config.heroBadge}
          </span>

          <h1 className="display-font max-w-2xl text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
            {homepageData.config.heroTitle}
          </h1>

          <p className="max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            {homepageData.config.heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/actualite" className="btn-primary px-6 py-3 text-sm">
              Voir l&apos;actualité
            </Link>
            <Link href="/naneye-yarda/services" className="btn-ghost px-6 py-3 text-sm">
              Services municipaux
            </Link>
          </div>

        </Reveal>

        <Reveal direction="left">
          <HomeCarousel items={homepageData.sliderItems} />
        </Reveal>
      </section>

      <section className="py-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Chiffres clés</p>
          <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">
            Indicateurs municipaux 2025-2026
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {impactFigures.map((figure, index) => (
            <Reveal key={figure.title} delay={index * 0.06} className="soft-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(19,136,74,0.1)] text-[var(--green-deep)]">
                  <ImpactIcon icon={figure.icon} />
                </span>
                <p className="text-3xl font-extrabold text-[var(--orange-strong)]">{figure.value}</p>
              </div>
              <h3 className="mt-2 text-lg font-extrabold text-[var(--green-deep)]">{figure.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{figure.detail}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative right-1/2 left-1/2 my-10 w-screen -translate-x-1/2 border-y border-[var(--line)] bg-[linear-gradient(130deg,rgba(15,102,57,0.95),rgba(11,78,44,0.95))] py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(255,206,161,0.95)]">
                Événement à venir
              </p>
              <h2 className="display-font mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                Journée de salubrité publique
              </h2>
            </div>
            <span className="rounded-full border border-white/24 bg-white/12 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-[rgba(255,222,189,0.95)]">
              {featuredEvent.edition}
            </span>
          </Reveal>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <EventCountdown
                targetDate={featuredEvent.targetDate}
                title={featuredEvent.title}
                location={featuredEvent.location}
              />
            </Reveal>

            <Reveal className="rounded-2xl border border-white/22 bg-white/12 p-5 text-white backdrop-blur-md sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(255,222,189,0.95)]">
                  Dimanche 29 mars 2026
                </span>
                <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(255,222,189,0.95)]">
                  Dès 08h00
                </span>
              </div>

              <h3 className="mt-4 text-2xl leading-tight font-extrabold text-white sm:text-3xl">
                {featuredEvent.message}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
                {featuredEvent.callout}
              </p>

              <div className="mt-6 rounded-xl border border-white/18 bg-black/18 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[rgba(255,211,174,0.95)]">
                  Secteurs de nettoyage
                </p>
                <div className="mt-4 space-y-3">
                  {featuredEvent.sectors.map((sector, index) => (
                    <div key={sector} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(240,122,20,0.24)] text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-white/92">{sector}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-12">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">
              Quelques actualités
            </p>
            <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">Informations municipales</h2>
          </div>
          <Link href="/actualite" className="btn-ghost px-5 py-2 text-sm">
            Voir toutes les actualités
          </Link>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index * 0.08}
              className="group relative h-[360px] overflow-hidden rounded-2xl border border-[rgba(19,136,74,0.2)] shadow-[0_24px_55px_rgba(13,40,28,0.18)]"
            >
              <Image
                src={item.featuredImage || actualitePhotos[index % actualitePhotos.length]}
                alt={item.title}
                fill
                unoptimized={isUploadedAssetPath(item.featuredImage)}
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,13,8,0.85)] via-[rgba(5,13,8,0.25)] to-transparent" />

              <div className="absolute top-4 right-4 left-4 flex items-center justify-between gap-2">
                <span className="rounded-lg border border-white/30 bg-white/18 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                  {item.section}
                </span>
                <span className="rounded-lg border border-white/30 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/95 backdrop-blur-sm">
                  {formatFrenchDate(item.publishedAt)}
                </span>
              </div>

              <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-white/20 bg-white/14 p-4 backdrop-blur-md transition-all duration-300 group-hover:bg-white/24 group-hover:backdrop-blur-xl">
                <h3 className="text-lg leading-snug font-extrabold text-white">{item.title}</h3>
                <p className="mt-2 max-h-0 overflow-hidden text-xs leading-6 text-white/90 opacity-0 transition-all duration-300 group-hover:max-h-28 group-hover:opacity-100">
                  {item.excerpt}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,208,168,0.95)]">
                  {item.location}
                </p>
              </div>
              <Link href={`/actualite/${item.slug}`} aria-label={item.title} className="absolute inset-0 z-10" />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
