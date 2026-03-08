import { ContentStatus, NewsCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SectionName = "Actualité" | "Naneye Yarda" | "Le centenaire";

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string | null;
  section: SectionName;
  location: string;
  featuredImage?: string | null;
  gallery?: {
    id: string;
    imagePath: string;
    caption?: string | null;
    sortOrder: number;
  }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  publishedAt: Date;
};

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string | null;
  category: NewsCategory;
  location: string;
  featuredImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  publishedAt: Date;
};

const categoryLabel: Record<NewsCategory, SectionName> = {
  [NewsCategory.ACTUALITE]: "Actualité",
  [NewsCategory.NANEYE_YARDA]: "Naneye Yarda",
  [NewsCategory.CENTENAIRE]: "Le centenaire",
};

const sectionToCategory: Record<SectionName, NewsCategory> = {
  "Actualité": NewsCategory.ACTUALITE,
  "Naneye Yarda": NewsCategory.NANEYE_YARDA,
  "Le centenaire": NewsCategory.CENTENAIRE,
};

const newsSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  category: true,
  location: true,
  featuredImage: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  publishedAt: true,
} as const;

const demoNews: NewsItem[] = [
  {
    id: "demo-1",
    slug: "programme-voirie-5-arrondissements",
    title: "Lancement d'un programme de voirie dans 5 arrondissements",
    excerpt:
      "La Ville de Niamey déploie une nouvelle phase de réhabilitation urbaine pour améliorer la circulation et la sécurité des quartiers.",
    content:
      "La mairie coordonne la réhabilitation de plusieurs axes stratégiques afin de fluidifier la mobilité et renforcer la sécurité des usagers.",
    section: "Actualité",
    location: "Niamey Centre",
    featuredImage: "/media/municipalite-1.jpg",
    publishedAt: new Date("2026-02-28"),
  },
  {
    id: "demo-2",
    slug: "naneye-yarda-jeunes-proprete-urbaine",
    title: "Naneye Yarda: 2 000 jeunes mobilisés pour la propreté urbaine",
    excerpt:
      "Des équipes citoyennes renforcent les opérations de nettoyage et de sensibilisation dans les marchés et axes principaux.",
    content:
      "Les opérations hebdomadaires réunissent les services municipaux, les associations de quartier et les volontaires pour une ville plus propre.",
    section: "Naneye Yarda",
    location: "Rive Droite",
    featuredImage: "/media/municipalite-2.jpg",
    publishedAt: new Date("2026-02-25"),
  },
  {
    id: "demo-3",
    slug: "centenaire-appel-projets-culturels",
    title: "Le centenaire: appel à projets culturels de quartier",
    excerpt:
      "La mairie ouvre un appel à propositions pour valoriser l'histoire de Niamey à travers des expositions, spectacles et archives.",
    content:
      "Ce programme du centenaire finance des initiatives locales mêlant mémoire urbaine, création artistique et participation citoyenne.",
    section: "Le centenaire",
    location: "Hôtel de Ville",
    featuredImage: "/media/centenaire-1.jpg",
    publishedAt: new Date("2026-02-20"),
  },
];

function mapRowToNewsItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    section: categoryLabel[row.category] ?? "Actualité",
    location: row.location,
    featuredImage: row.featuredImage,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    seoKeywords: row.seoKeywords,
    publishedAt: row.publishedAt,
  };
}

function applyDemoNewsFilters(items: NewsItem[], query: string, section?: SectionName): NewsItem[] {
  const loweredQuery = query.toLocaleLowerCase("fr");
  return items.filter((item) => {
    if (section && item.section !== section) {
      return false;
    }
    if (!loweredQuery) {
      return true;
    }
    const searchableText = [item.title, item.excerpt, item.location, item.content ?? ""].join(" ").toLocaleLowerCase("fr");
    return searchableText.includes(loweredQuery);
  });
}

export async function getLatestNews(limit = 6): Promise<NewsItem[]> {
  return searchNews({ limit });
}

type SearchNewsOptions = {
  query?: string;
  section?: SectionName;
  limit?: number;
};

export async function searchNews({ query, section, limit = 30 }: SearchNewsOptions = {}): Promise<NewsItem[]> {
  const normalizedQuery = query?.trim() ?? "";

  if (!process.env.DATABASE_URL) {
    return applyDemoNewsFilters(demoNews, normalizedQuery, section).slice(0, limit);
  }

  try {
    const where = {
      status: ContentStatus.PUBLISHED,
      ...(section ? { category: sectionToCategory[section] } : {}),
      ...(normalizedQuery
        ? {
            OR: [
              { title: { contains: normalizedQuery, mode: "insensitive" as const } },
              { excerpt: { contains: normalizedQuery, mode: "insensitive" as const } },
              { content: { contains: normalizedQuery, mode: "insensitive" as const } },
              { location: { contains: normalizedQuery, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const rows = await prisma.actualite.findMany({
      take: limit,
      orderBy: { publishedAt: "desc" },
      where,
      select: newsSelect,
    });

    if (rows.length === 0) {
      if (normalizedQuery || section) {
        return [];
      }
      return demoNews.slice(0, limit);
    }

    return rows.map(mapRowToNewsItem);
  } catch {
    return applyDemoNewsFilters(demoNews, normalizedQuery, section).slice(0, limit);
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  if (!process.env.DATABASE_URL) {
    return demoNews.find((item) => item.slug === slug) ?? null;
  }

  try {
    const row = await prisma.actualite.findUnique({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: {
        gallery: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      section: categoryLabel[row.category] ?? "Actualité",
      location: row.location,
      featuredImage: row.featuredImage,
      gallery: row.gallery,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      seoKeywords: row.seoKeywords,
      publishedAt: row.publishedAt,
    };
  } catch {
    return demoNews.find((item) => item.slug === slug) ?? null;
  }
}
