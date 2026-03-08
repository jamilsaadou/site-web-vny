import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type MunicipalEvent = {
  id: string;
  slug: string;
  title: string;
  detail: string;
  location: string;
  featuredImage?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  startAt: Date;
};

const demoEvents: MunicipalEvent[] = [
  {
    id: "demo-event-1",
    slug: "forum-municipal-naney-yarda-2026",
    title: "Forum municipal Naney Yarda 2026",
    detail: "Présentation des priorités de gouvernance municipale, civisme urbain et services de proximité.",
    location: "Palais des Congrès de Niamey",
    featuredImage: "/media/centenaire-2.jpg",
    latitude: 13.5137,
    longitude: 2.1098,
    startAt: new Date("2026-04-18T09:00:00+01:00"),
  },
  {
    id: "demo-event-2",
    slug: "journee-citoyenne-salubrite-inter-quartiers",
    title: "Journée citoyenne de salubrité inter-quartiers",
    detail: "Mobilisation simultanée des quartiers pour nettoyage, tri et sensibilisation.",
    location: "5 arrondissements de Niamey",
    featuredImage: "/media/municipalite-2.jpg",
    latitude: 13.526,
    longitude: 2.116,
    startAt: new Date("2026-05-11T06:30:00+01:00"),
  },
];

export async function getUpcomingEvents(limit = 2): Promise<MunicipalEvent[]> {
  if (!process.env.DATABASE_URL) {
    return demoEvents.slice(0, limit);
  }

  try {
    const rows = await prisma.event.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        startAt: {
          gte: new Date(),
        },
      },
      orderBy: { startAt: "asc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        detail: true,
        location: true,
        featuredImage: true,
        latitude: true,
        longitude: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        startAt: true,
      },
    });

    if (rows.length === 0) {
      return demoEvents.slice(0, limit);
    }

    return rows;
  } catch {
    return demoEvents.slice(0, limit);
  }
}
