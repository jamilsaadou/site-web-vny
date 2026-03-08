import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import {
  type CentenaryIconName,
  defaultCentenaireConfig,
  mergeCentenaireConfig,
  parseAgenda,
  parseGallery,
  parseKeyFacts,
  parseMilestones,
  parseObjectives,
  parseStrategicAxes,
} from "@/lib/centenaire-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function CentenaryIcon({ icon }: { icon: CentenaryIconName }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (icon) {
    case "archive":
      return (
        <svg {...commonProps}>
          <path d="M4 7h16v13H4z" />
          <path d="M3 7h18V4H3zM9 12h6M9 16h6" />
        </svg>
      );
    case "people":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="9" r="2.5" />
          <circle cx="16" cy="9.5" r="2" />
          <path d="M4.5 19a4.5 4.5 0 0 1 9 0M13 19a3.5 3.5 0 0 1 7 0" />
        </svg>
      );
    case "spark":
      return (
        <svg {...commonProps}>
          <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" />
          <path d="M19 3v2M20 4h-2M4 18v3M5.5 19.5h-3" />
        </svg>
      );
    case "city":
      return (
        <svg {...commonProps}>
          <path d="M3 21h18M6 21V7l5-3v17M16 21V10l3 2v9" />
          <path d="M8 10h1M8 13h1M8 16h1M11 10h1M11 13h1M11 16h1M17 14h1M17 17h1" />
        </svg>
      );
    case "handshake":
      return (
        <svg {...commonProps}>
          <path d="M8 12l2.2-2.2a2 2 0 0 1 2.8 0L16 12" />
          <path d="M3 11l4-3 3 3-3 3-4-3zM21 11l-4-3-3 3 3 3 4-3z" />
          <path d="M10.5 13.5l1.2 1.2a1.5 1.5 0 0 0 2.1 0l1.4-1.4" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...commonProps}>
          <path d="M19 5c-7 0-11 4-11 11 7 0 11-4 11-11z" />
          <path d="M5 19c0-4 2-6 6-8M4 4v5M2 6h4" />
        </svg>
      );
    case "culture":
      return (
        <svg {...commonProps}>
          <path d="M4 21h16M7 21V8l5-4 5 4v13" />
          <path d="M9 12h6M9 15h6" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7 14l2.5 2.5L17 9" />
          <path d="M12 3v3M12 18v3" />
        </svg>
      );
  }
}

async function getCentenaireConfig() {
  if (!process.env.DATABASE_URL) {
    return defaultCentenaireConfig;
  }

  try {
    const config = await prisma.centenaireConfig.findUnique({
      where: { id: "main" },
    });
    return mergeCentenaireConfig(config);
  } catch {
    return defaultCentenaireConfig;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getCentenaireConfig();
  return {
    title: config.seoTitle || "Le centenaire | Ville de Niamey",
    description:
      config.seoDescription ||
      "Programme officiel du centenaire de la Ville de Niamey: mémoire, culture, innovation et engagement citoyen.",
    keywords: config.seoKeywords || "centenaire niamey, ville de niamey, programme 2026",
  };
}

export default async function CentenairePage() {
  const config = await getCentenaireConfig();
  const keyFacts = parseKeyFacts(config.keyFactsLines);
  const milestones = parseMilestones(config.milestonesLines);
  const objectives = parseObjectives(config.objectivesLines);
  const strategicAxes = parseStrategicAxes(config.strategicAxesLines);
  const annualAgenda = parseAgenda(config.annualAgendaLines);
  const gallery = parseGallery(config.galleryLines);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch">
          <div className="soft-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">{config.heroBadge}</p>
            <h1 className="display-font mt-2 text-4xl leading-tight font-extrabold sm:text-5xl">{config.heroTitle}</h1>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">{config.heroIntro}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {keyFacts.map((item) => (
                <div key={`${item.label}-${item.value}`} className="rounded-lg border border-[var(--line)] bg-[rgba(255,255,255,0.8)] p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--green-deep)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={config.heroPrimaryCtaHref} className="btn-primary px-6 py-3 text-sm">
                {config.heroPrimaryCtaLabel}
              </Link>
              <Link href={config.heroSecondaryCtaHref} className="btn-ghost px-6 py-3 text-sm">
                {config.heroSecondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="soft-card relative h-[320px] overflow-hidden sm:h-[420px]">
            <Image
              src={config.heroImagePath}
              alt={config.heroImageEyebrow || "Vue aérienne de la Ville de Niamey"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,20,15,0.66)] via-[rgba(10,20,15,0.14)] to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-white/25 bg-white/12 p-4 text-white backdrop-blur-md sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgba(255,215,184,0.95)]">{config.heroImageEyebrow}</p>
              <p className="mt-1 text-sm leading-6 text-white/92 sm:text-base">{config.heroImageCaption}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="py-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">{config.milestonesEyebrow}</p>
          <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">{config.milestonesTitle}</h2>
        </Reveal>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {milestones.map((item, index) => (
            <Reveal key={`${item.year}-${item.title}`} delay={index * 0.06} className="soft-card p-5">
              <p className="inline-flex rounded-lg bg-[rgba(240,122,20,0.14)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--orange-strong)]">
                {item.year}
              </p>
              <h3 className="mt-3 text-lg font-extrabold text-[var(--green-deep)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative right-1/2 left-1/2 my-12 w-screen -translate-x-1/2 border-y border-[var(--line)] bg-[linear-gradient(132deg,rgba(15,102,57,0.95),rgba(10,74,42,0.95))] py-12">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="rounded-xl border border-white/24 bg-white/10 p-6 text-white backdrop-blur-md sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(255,216,181,0.95)]">{config.themeEyebrow}</p>
            <h2 className="display-font mt-2 text-3xl leading-tight font-extrabold sm:text-4xl">{config.themeTitle}</h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-white/90 sm:text-base">{config.themeDescription}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">{config.objectivesEyebrow}</p>
          <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">{config.objectivesTitle}</h2>
        </Reveal>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {objectives.map((item, index) => (
            <Reveal key={`${item.title}-${index}`} delay={index * 0.06} className="soft-card p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(19,136,74,0.1)] text-[var(--green-deep)]">
                <CentenaryIcon icon={item.icon} />
              </span>
              <h3 className="mt-3 text-lg font-extrabold text-[var(--green-deep)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.detail}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-12">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">{config.axesEyebrow}</p>
          <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">{config.axesTitle}</h2>
        </Reveal>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {strategicAxes.map((axis, index) => (
            <Reveal
              key={`${axis.title}-${index}`}
              delay={index * 0.05}
              className="rounded-xl border border-[rgba(19,136,74,0.22)] bg-[rgba(255,255,255,0.92)] p-5 shadow-[0_18px_42px_rgba(14,36,25,0.11)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(240,122,20,0.14)] text-[var(--orange-strong)]">
                  <CentenaryIcon icon={axis.icon} />
                </span>
                <h3 className="text-base font-extrabold text-[var(--green-deep)] sm:text-lg">{axis.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{axis.detail}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-2">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">{config.agendaEyebrow}</p>
            <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">{config.agendaTitle}</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">{config.agendaSubtitle}</p>
        </Reveal>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {annualAgenda.map((item, index) => (
            <Reveal
              key={`${item.month}-${item.theme}`}
              delay={index * 0.04}
              className="rounded-xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--green-deep)]">{item.month}</p>
                <span className="h-2 w-2 rounded-full bg-[var(--orange-strong)]" />
              </div>
              <h3 className="mt-2 text-base font-extrabold text-[var(--green-deep)]">{item.theme}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.highlights}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-12">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">{config.galleryEyebrow}</p>
          <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">{config.galleryTitle}</h2>
        </Reveal>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {gallery.map((item, index) => (
            <Reveal key={`${item.src}-${index}`} delay={index * 0.08} className="soft-card overflow-hidden">
              <div className="relative h-52">
                <Image src={item.src} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-[var(--green-deep)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap gap-3">
          <Link href={config.galleryPrimaryCtaHref} className="btn-primary inline-flex px-6 py-3 text-sm">
            {config.galleryPrimaryCtaLabel}
          </Link>
          <Link href={config.gallerySecondaryCtaHref} className="btn-ghost inline-flex px-6 py-3 text-sm">
            {config.gallerySecondaryCtaLabel}
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
