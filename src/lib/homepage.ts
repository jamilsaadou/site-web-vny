import type { Metadata } from "next";
import type { GalleryItem } from "@/lib/media";
import { homeCarouselImages } from "@/lib/media";
import { prisma } from "@/lib/prisma";

export type HomepageConfigData = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

const fallbackConfig: HomepageConfigData = {
  heroBadge: "Ville de Niamey",
  heroTitle: "Une plateforme moderne pour suivre la vie de votre ville.",
  heroSubtitle:
    "Suivez l'actualité municipale, les actions Naneye Yarda, le programme du centenaire et les services de contact de la mairie dans une interface claire, rapide et animée.",
  seoTitle: "Ville de Niamey | Portail municipal",
  seoDescription:
    "Plateforme officielle de la Ville de Niamey: actualités, initiatives Naneye Yarda, centenaire et contact.",
  seoKeywords: "ville de niamey, mairie, actualités, services municipaux",
};

export async function getHomepageData() {
  if (!process.env.DATABASE_URL) {
    return {
      config: fallbackConfig,
      sliderItems: homeCarouselImages,
    };
  }

  try {
    const [configRow, sliderRows] = await Promise.all([
      prisma.homepageConfig.findUnique({ where: { id: "main" } }),
      prisma.sliderItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const config: HomepageConfigData = {
      heroBadge: configRow?.heroBadge || fallbackConfig.heroBadge,
      heroTitle: configRow?.heroTitle || fallbackConfig.heroTitle,
      heroSubtitle: configRow?.heroSubtitle || fallbackConfig.heroSubtitle,
      seoTitle: configRow?.seoTitle || fallbackConfig.seoTitle,
      seoDescription: configRow?.seoDescription || fallbackConfig.seoDescription,
      seoKeywords: configRow?.seoKeywords || fallbackConfig.seoKeywords,
    };

    const sliderItems: GalleryItem[] =
      sliderRows.length > 0
        ? sliderRows.map((item) => ({
            src: item.imagePath,
            title: item.title,
            description: item.description,
          }))
        : homeCarouselImages;

    return {
      config,
      sliderItems,
    };
  } catch {
    return {
      config: fallbackConfig,
      sliderItems: homeCarouselImages,
    };
  }
}

export async function getHomepageMetadata(): Promise<Metadata> {
  const data = await getHomepageData();
  return {
    title: data.config.seoTitle,
    description: data.config.seoDescription,
    keywords: data.config.seoKeywords,
  };
}
