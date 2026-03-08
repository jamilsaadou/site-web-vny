import type { CentenaireConfig } from "@prisma/client";

export type CentenaryIconName =
  | "archive"
  | "people"
  | "spark"
  | "city"
  | "handshake"
  | "leaf"
  | "culture"
  | "sport";

export type CentenaryKeyFact = {
  label: string;
  value: string;
};

export type CentenaryMilestone = {
  year: string;
  title: string;
  text: string;
};

export type CentenaryObjective = {
  icon: CentenaryIconName;
  title: string;
  detail: string;
};

export type CentenaryAgendaItem = {
  month: string;
  theme: string;
  highlights: string;
};

export type CentenaryGalleryItem = {
  src: string;
  title: string;
  description: string;
};

export type CentenaireConfigDefaults = {
  heroBadge: string;
  heroTitle: string;
  heroIntro: string;
  heroImagePath: string;
  heroImageEyebrow: string;
  heroImageCaption: string;
  keyFactsLines: string;
  milestonesEyebrow: string;
  milestonesTitle: string;
  milestonesLines: string;
  themeEyebrow: string;
  themeTitle: string;
  themeDescription: string;
  objectivesEyebrow: string;
  objectivesTitle: string;
  objectivesLines: string;
  axesEyebrow: string;
  axesTitle: string;
  strategicAxesLines: string;
  agendaEyebrow: string;
  agendaTitle: string;
  agendaSubtitle: string;
  annualAgendaLines: string;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryLines: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  galleryPrimaryCtaLabel: string;
  galleryPrimaryCtaHref: string;
  gallerySecondaryCtaLabel: string;
  gallerySecondaryCtaHref: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
};

export const CENTENARY_ALLOWED_ICONS: readonly CentenaryIconName[] = [
  "archive",
  "people",
  "spark",
  "city",
  "handshake",
  "leaf",
  "culture",
  "sport",
] as const;

const allowedIconSet = new Set<string>(CENTENARY_ALLOWED_ICONS);

export const defaultCentenaireConfig: CentenaireConfigDefaults = {
  heroBadge: "Le centenaire",
  heroTitle: "Niamey, 100 ans d'histoire, de résilience et d'avenir",
  heroIntro:
    "En 2026, la Ville de Niamey commémore son centenaire autour d'un programme annuel solennel, éducatif, culturel, festif et prospectif, pour honorer son histoire et accélérer sa modernisation.",
  heroImagePath: "/photo-drone-niamey.jpeg",
  heroImageEyebrow: "Niamey vue du ciel",
  heroImageCaption:
    "Une capitale en mouvement, entre mémoire urbaine, cohésion citoyenne et ambition de transformation.",
  keyFactsLines: [
    "Décret fondateur|26 décembre 1926",
    "Année de célébration|2026",
    "Durée du programme|Janvier - Décembre",
  ].join("\n"),
  milestonesEyebrow: "Repères historiques",
  milestonesTitle: "Étapes clés de la ville",
  milestonesLines: [
    "1926|Élévation de Niamey en chef-lieu|Le décret du 26 décembre 1926 marque l'ancrage institutionnel de la ville.",
    "1960|Capitale du Niger indépendant|Niamey devient le centre politique et administratif de la République du Niger.",
    "2000+|Accélération urbaine|Croissance démographique, renforcement des infrastructures et modernisation municipale.",
    "2026|Centenaire de la Ville de Niamey|Commémoration historique et projection stratégique vers une ville durable et résiliente.",
  ].join("\n"),
  themeEyebrow: "Thème général",
  themeTitle: "« Niamey, 100 ans d'histoire, de résilience et d'avenir »",
  themeDescription:
    "La commémoration vise à honorer la mémoire historique de la ville tout en mobilisant les forces vives autour d'une dynamique de développement durable, d'innovation municipale et de citoyenneté responsable.",
  objectivesEyebrow: "Objectifs",
  objectivesTitle: "Objectif général et objectifs spécifiques",
  objectivesLines: [
    "archive|Valoriser le patrimoine|Mettre en lumière l'histoire, la culture et le patrimoine architectural de Niamey.",
    "people|Renforcer l'identité citoyenne|Consolider le sentiment d'appartenance et la fierté collective autour de la capitale.",
    "spark|Stimuler l'innovation|Promouvoir les idées nouvelles, l'engagement des jeunes et la participation citoyenne.",
    "city|Préparer l'avenir urbain|Réfléchir aux défis et opportunités de la ville en matière d'urbanisme et de services.",
    "handshake|Fédérer les partenaires|Mobiliser les acteurs techniques, financiers et culturels autour de projets porteurs.",
    "leaf|Ancrer le développement durable|Inscrire les actions du centenaire dans une dynamique de résilience environnementale.",
  ].join("\n"),
  axesEyebrow: "Axes stratégiques",
  axesTitle: "Le cadre d'action du programme",
  strategicAxesLines: [
    "archive|Mémoire & patrimoine|Sauvegarde et valorisation de l'histoire de Niamey.",
    "culture|Culture & identité|Mise en lumière de la diversité culturelle de la ville.",
    "spark|Innovation & modernité|Promotion des projets porteurs pour l'avenir de la capitale.",
    "leaf|Citoyenneté & environnement|Engagement communautaire, salubrité et écoresponsabilité.",
    "sport|Sport & jeunesse|Inclusion des jeunes dans la dynamique de transformation urbaine.",
    "handshake|Festivités & reconnaissance|Organisation d'événements commémoratifs, hommages et célébrations.",
  ].join("\n"),
  agendaEyebrow: "Calendrier prévisionnel 2026",
  agendaTitle: "Programmation mensuelle",
  agendaSubtitle: "12 mois d'activités thématiques, culturelles, civiques et institutionnelles.",
  annualAgendaLines: [
    "Janvier|Lancement officiel|Cérémonie solennelle et conférences historiques.",
    "Février|Mémoire et patrimoine|Exposition photo, documentaires, concours interscolaires.",
    "Mars|Culture et art urbain|Festival, fresques murales, slam et théâtre de rue.",
    "Avril|Économie et innovation|Forum économique, expo-vente et hackathons.",
    "Mai|Environnement - Niamey Propre|Reboisement et actions citoyennes de salubrité.",
    "Juin|Sports & jeunesse|Tournois inter-quartiers, randonnées, forum jeunesse.",
    "Juillet|Spiritualité et dialogue|Prières, témoignages et activités de cohésion sociale.",
    "Août|Savoir & éducation|Colloques, bourses et publication du livre-mémoire.",
    "Septembre|Urbanisme|Expositions de projets, visites guidées et dialogue urbain.",
    "Octobre|Identité & diversité|Semaine des cultures et carnaval des quartiers.",
    "Novembre|Hommages & reconnaissance|Célébration des bâtisseurs et plaques historiques.",
    "Décembre|Clôture & apothéose|Inauguration du Monument du Centenaire et concert final.",
  ].join("\n"),
  galleryEyebrow: "Galerie du programme",
  galleryTitle: "Images des activités officielles",
  galleryLines: [
    "/media/centenaire-1.jpg|Ouverture officielle|Démarrage du programme commémoratif du centenaire de Niamey.",
    "/media/centenaire-2.jpg|Partenariat institutionnel|Participation des institutions et partenaires au programme historique.",
    "/media/centenaire-3.jpg|Valorisation de l'histoire|Mise en avant de la mémoire urbaine et des transformations de la ville.",
  ].join("\n"),
  heroPrimaryCtaLabel: "Suivre les annonces",
  heroPrimaryCtaHref: "/actualite",
  heroSecondaryCtaLabel: "Contacter le comité",
  heroSecondaryCtaHref: "/contact",
  galleryPrimaryCtaLabel: "Actualités du centenaire",
  galleryPrimaryCtaHref: "/actualite",
  gallerySecondaryCtaLabel: "Proposer un partenariat",
  gallerySecondaryCtaHref: "/contact",
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
};

function splitNonEmptyLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseTwoColumns(line: string) {
  const [first = "", ...rest] = line.split("|");
  return [first.trim(), rest.join("|").trim()] as const;
}

function parseThreeColumns(line: string) {
  const [first = "", second = "", ...rest] = line.split("|");
  return [first.trim(), second.trim(), rest.join("|").trim()] as const;
}

function normalizeIcon(value: string, fallback: CentenaryIconName): CentenaryIconName {
  const normalized = value.trim().toLowerCase();
  if (allowedIconSet.has(normalized)) {
    return normalized as CentenaryIconName;
  }
  return fallback;
}

export function mergeCentenaireConfig(config: CentenaireConfig | null | undefined): CentenaireConfigDefaults {
  if (!config) {
    return defaultCentenaireConfig;
  }

  return {
    ...defaultCentenaireConfig,
    ...config,
  };
}

export function parseKeyFacts(lines: string): CentenaryKeyFact[] {
  const parsed = splitNonEmptyLines(lines)
    .map((line) => {
      const [label, value] = parseTwoColumns(line);
      if (!label || !value) {
        return null;
      }
      return { label, value };
    })
    .filter((item): item is CentenaryKeyFact => Boolean(item));

  if (parsed.length > 0) {
    return parsed;
  }

  return parseKeyFacts(defaultCentenaireConfig.keyFactsLines);
}

export function parseMilestones(lines: string): CentenaryMilestone[] {
  const parsed = splitNonEmptyLines(lines)
    .map((line) => {
      const [year, title, text] = parseThreeColumns(line);
      if (!year || !title || !text) {
        return null;
      }
      return { year, title, text };
    })
    .filter((item): item is CentenaryMilestone => Boolean(item));

  if (parsed.length > 0) {
    return parsed;
  }

  return parseMilestones(defaultCentenaireConfig.milestonesLines);
}

export function parseObjectives(lines: string): CentenaryObjective[] {
  const parsed = splitNonEmptyLines(lines)
    .map((line) => {
      const [iconRaw, title, detail] = parseThreeColumns(line);
      if (!title || !detail) {
        return null;
      }
      return {
        icon: normalizeIcon(iconRaw, "archive"),
        title,
        detail,
      };
    })
    .filter((item): item is CentenaryObjective => Boolean(item));

  if (parsed.length > 0) {
    return parsed;
  }

  return parseObjectives(defaultCentenaireConfig.objectivesLines);
}

export function parseStrategicAxes(lines: string): CentenaryObjective[] {
  const parsed = splitNonEmptyLines(lines)
    .map((line) => {
      const [iconRaw, title, detail] = parseThreeColumns(line);
      if (!title || !detail) {
        return null;
      }
      return {
        icon: normalizeIcon(iconRaw, "archive"),
        title,
        detail,
      };
    })
    .filter((item): item is CentenaryObjective => Boolean(item));

  if (parsed.length > 0) {
    return parsed;
  }

  return parseStrategicAxes(defaultCentenaireConfig.strategicAxesLines);
}

export function parseAgenda(lines: string): CentenaryAgendaItem[] {
  const parsed = splitNonEmptyLines(lines)
    .map((line) => {
      const [month, theme, highlights] = parseThreeColumns(line);
      if (!month || !theme || !highlights) {
        return null;
      }
      return { month, theme, highlights };
    })
    .filter((item): item is CentenaryAgendaItem => Boolean(item));

  if (parsed.length > 0) {
    return parsed;
  }

  return parseAgenda(defaultCentenaireConfig.annualAgendaLines);
}

export function parseGallery(lines: string): CentenaryGalleryItem[] {
  const parsed = splitNonEmptyLines(lines)
    .map((line) => {
      const [src, title, description] = parseThreeColumns(line);
      if (!src || !title || !description) {
        return null;
      }
      return { src, title, description };
    })
    .filter((item): item is CentenaryGalleryItem => Boolean(item));

  if (parsed.length > 0) {
    return parsed;
  }

  return parseGallery(defaultCentenaireConfig.galleryLines);
}
