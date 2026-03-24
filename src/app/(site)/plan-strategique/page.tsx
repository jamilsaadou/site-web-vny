import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Plan stratégique 2025-2027 | Ville de Niamey",
  description:
    "Plan stratégique 2025-2027 de l'Administrateur Délégué et programmes phares actuels de la Ville de Niamey.",
  keywords: "plan stratégique niamey, programmes phares vny, ville de niamey, 2025 2027",
};

type StrategicAxisIconName = "cohesion" | "governance" | "economy" | "social";

type StrategicAxis = {
  number: string;
  icon: StrategicAxisIconName;
  title: string;
  objective: string;
  keyPoints: string;
};

type FlagshipProgramIconName = "week" | "tree" | "landmark" | "salubrite" | "clean" | "pave";

type FlagshipProgram = {
  number: string;
  icon: FlagshipProgramIconName;
  title: string;
  detail: string;
};

const strategicAxes: StrategicAxis[] = [
  {
    number: "01",
    icon: "cohesion",
    title: "Renforcement de la sécurité et de la cohésion sociale",
    objective: "Faire de Niamey une ville sûre, unie et solidaire.",
    keyPoints:
      "Collaboration FDS-Population, promotion du dialogue intercommunautaire, valorisation de la jeunesse à travers le concept de brigade verte.",
  },
  {
    number: "02",
    icon: "governance",
    title: "Promotion de la bonne gouvernance",
    objective: "Instaurer une administration municipale efficace, transparente et au service des citoyens.",
    keyPoints: "Lutte contre la corruption, amélioration des services publics, participation citoyenne.",
  },
  {
    number: "03",
    icon: "economy",
    title: "Développement des bases de la souveraineté économique",
    objective: "Faire de Niamey un pôle économique dynamique et autosuffisant.",
    keyPoints:
      "Promotion de l'agriculture urbaine, développement des filières locales, soutien à l'entrepreneuriat des jeunes et digitalisation des services municipaux.",
  },
  {
    number: "04",
    icon: "social",
    title: "Accélération des réformes sociales",
    objective: "Améliorer significativement les conditions de vie des Niaméens.",
    keyPoints:
      "Réforme du système éducatif, amélioration de l'accès aux soins, promotion d'un système de protection sociale adapté.",
  },
];

const flagshipPrograms: FlagshipProgram[] = [
  {
    number: "01",
    icon: "week",
    title: "Une semaine, un quartier",
    detail:
      "Déploiement hebdomadaire d'actions de proximité dans les quartiers pour l'assainissement, l'écoute citoyenne et l'amélioration du cadre de vie.",
  },
  {
    number: "02",
    icon: "tree",
    title: "Plantation de 100 000 arbres dans le cadre du centenaire",
    detail:
      "Campagne de reboisement urbain et communautaire pour renforcer la résilience climatique et inscrire le centenaire dans une dynamique durable.",
  },
  {
    number: "03",
    icon: "landmark",
    title: "Baptêmes des rues, places, boulevards et espaces dans une logique de réappropriation nationale",
    detail:
      "Opération de dénomination et de revalorisation des espaces publics pour affirmer l'identité nationale et la mémoire collective.",
  },
  {
    number: "04",
    icon: "salubrite",
    title: "Éditions mensuelles de salubrité",
    detail:
      "Rendez-vous mensuel de mobilisation citoyenne pour le nettoyage, la sensibilisation et l'entretien des espaces publics.",
  },
  {
    number: "05",
    icon: "clean",
    title: "Niamey, Ville propre",
    detail:
      "Initiative permanente d'assainissement urbain visant une ville plus saine, plus ordonnée et plus attractive.",
  },
  {
    number: "06",
    icon: "pave",
    title: "Initiative de construction des pavés par les jeunes",
    detail:
      "Appui à la production locale de pavés par la jeunesse pour soutenir l'emploi, l'embellissement urbain et l'aménagement des voies.",
  },
];

function StrategicAxisIcon({ icon }: { icon: StrategicAxisIconName }) {
  const commonProps = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (icon) {
    case "cohesion":
      return (
        <svg {...commonProps}>
          <path d="M12 21s-7-4.7-7-10.5V5.8L12 3l7 2.8v4.7C19 16.3 12 21 12 21z" />
          <path d="M9.5 11.5h5M12 9v5" />
        </svg>
      );
    case "governance":
      return (
        <svg {...commonProps}>
          <path d="M3 9h18M5 9v8M10 9v8M14 9v8M19 9v8M3 21h18" />
          <path d="M12 3l9 4H3l9-4z" />
        </svg>
      );
    case "economy":
      return (
        <svg {...commonProps}>
          <path d="M12 20V9" />
          <path d="M8 12c0-3 2.2-5 4-5s4 2 4 5c-1.3 0-2.3.2-3.3.9-.8.5-1.4 1.2-1.7 2.1-.4-.9-1-1.6-1.8-2.1C10.3 12.2 9.3 12 8 12z" />
          <path d="M5 21h14" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M12 21c-4.4-2.5-7-6-7-10V5l7-2 7 2v6c0 4-2.6 7.5-7 10z" />
          <path d="M8.5 13.5h7" />
          <path d="M12 10v7" />
        </svg>
      );
  }
}

function FlagshipProgramIcon({ icon }: { icon: FlagshipProgramIconName }) {
  const commonProps = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (icon) {
    case "week":
      return (
        <svg {...commonProps}>
          <path d="M8 2v4M16 2v4" />
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 14h3M8 17h5" />
        </svg>
      );
    case "tree":
      return (
        <svg {...commonProps}>
          <path d="M12 21v-5" />
          <path d="M7 16h10" />
          <path d="M12 4c-3.5 0-6 2.8-6 6 0 1.6.7 3.1 1.8 4.2.8.8 1.9 1.8 4.2 1.8s3.4-1 4.2-1.8A6 6 0 0 0 18 10c0-3.2-2.5-6-6-6z" />
        </svg>
      );
    case "landmark":
      return (
        <svg {...commonProps}>
          <path d="M5 21V8l5-3 5 3v13" />
          <path d="M3 21h18" />
          <path d="M10 5V3" />
          <path d="M15 8h4l-2.5 3L19 14h-4" />
        </svg>
      );
    case "salubrite":
      return (
        <svg {...commonProps}>
          <path d="M8 4h8" />
          <path d="M10 4V2h4v2" />
          <path d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      );
    case "clean":
      return (
        <svg {...commonProps}>
          <path d="M5 15c2.2 0 2.8-1.5 4-4 1.1-2.2 2.3-3.5 5-3.5" />
          <path d="M14 7.5c3 0 5 2.2 5 5.2 0 4.3-4 7.3-8.2 7.3C6.3 20 3 17.3 3 13.7A5.7 5.7 0 0 1 8.7 8" />
          <path d="M16 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M4 17h16" />
          <path d="M7 17V9h10v8" />
          <path d="M9 13h2M13 13h2" />
          <path d="M9 9V6h6v3" />
        </svg>
      );
  }
}

export default function PlanStrategiquePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">
            Plan stratégique 2025-2027
          </p>
          <h1 className="display-font mt-2 text-4xl font-extrabold text-[var(--green-deep)] sm:text-5xl lg:text-6xl">
            Plan stratégique 2025-2027 de l&apos;Administrateur Délégué
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            En alignement avec la vision nationale du CNSP, notre plan s&apos;articule autour de quatre axes
            stratégiques.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {strategicAxes.map((axis, index) => (
            <Reveal
              key={axis.title}
              delay={index * 0.06}
              className="relative overflow-hidden rounded-[28px] border border-[rgba(19,136,74,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,250,246,0.96))] p-6 shadow-[0_24px_60px_rgba(10,36,24,0.08)] sm:p-7"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(19,136,74,0.96),rgba(240,122,20,0.9))]" />
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(19,136,74,0.1)] text-[var(--green-deep)]">
                  <StrategicAxisIcon icon={axis.icon} />
                </div>
                <span className="rounded-full border border-[rgba(240,122,20,0.2)] bg-[rgba(240,122,20,0.12)] px-3 py-1 text-xs font-bold tracking-[0.14em] text-[var(--orange-strong)]">
                  AXE {axis.number}
                </span>
              </div>

              <h2 className="mt-5 max-w-xl text-2xl leading-tight font-extrabold text-[var(--green-deep)]">
                {axis.title}
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
                <p>
                  <span className="font-extrabold text-[var(--green-deep)]">Objectif :</span> {axis.objective}
                </p>
                <p>
                  <span className="font-extrabold text-[var(--green-deep)]">Points clés :</span> {axis.keyPoints}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 overflow-hidden rounded-[30px] border border-[rgba(240,122,20,0.24)] bg-[linear-gradient(135deg,rgba(255,210,56,0.96),rgba(248,194,34,0.96))] p-6 shadow-[0_28px_60px_rgba(133,87,7,0.18)] sm:p-8">
          <p className="max-w-5xl text-base leading-8 text-[rgba(44,35,8,0.92)] sm:text-lg">
            Ces axes stratégiques guideront l&apos;ensemble de nos actions pour les trois prochaines années, avec pour
            ambition de transformer Niamey en un modèle de développement urbain durable, animé par la vision
            nationale de refondation et de souveraineté.
          </p>
          <p className="mt-5 max-w-5xl text-base leading-8 text-[rgba(44,35,8,0.92)] sm:text-lg">
            Chaque axe sera décliné en objectifs spécifiques et en actions concrètes, adaptées au contexte urbain de
            Niamey tout en restant fidèles aux orientations nationales définies par le CNSP. Notre approche sera
            holistique, reconnaissant l&apos;interdépendance de ces différents axes dans la réalisation de notre vision
            pour Niamey.
          </p>
        </Reveal>
      </section>

      <section className="py-2 pb-12">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">
              Programmes phares actuels
            </p>
            <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">
              Les initiatives prioritaires de la VNY
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            Une lecture claire des actions en cours pour l&apos;assainissement, l&apos;embellissement urbain et la
            mobilisation citoyenne.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {flagshipPrograms.map((program, index) => (
            <Reveal
              key={program.title}
              delay={index * 0.05}
              className="soft-card relative overflow-hidden border border-[rgba(19,136,74,0.18)] p-6"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(240,122,20,0.92),rgba(19,136,74,0.92))]" />
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(240,122,20,0.12)] text-[var(--orange-strong)]">
                  <FlagshipProgramIcon icon={program.icon} />
                </span>
                <span className="rounded-full border border-[rgba(19,136,74,0.18)] bg-[rgba(19,136,74,0.08)] px-3 py-1 text-xs font-bold tracking-[0.14em] text-[var(--green-deep)]">
                  {program.number}
                </span>
              </div>

              <h3 className="mt-5 text-xl leading-tight font-extrabold text-[var(--green-deep)]">{program.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{program.detail}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
