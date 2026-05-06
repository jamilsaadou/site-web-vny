import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type EventGalleryImage = {
  id: string;
  imagePath: string;
  caption?: string | null;
};

export type MunicipalEvent = {
  id: string;
  slug: string;
  title: string;
  detail: string;
  content?: string | null;
  location: string;
  featuredImage?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  startAt: Date;
  endAt?: Date | null;
  gallery?: EventGalleryImage[];
};

const demoEvents: MunicipalEvent[] = [
  {
    id: "demo-event-1",
    slug: "forum-municipal-naney-yarda-2026",
    title: "Forum municipal Naney Yarda 2026",
    detail: "Présentation des priorités de gouvernance municipale, civisme urbain et services de proximité.",
    content: null,
    location: "Palais des Congrès de Niamey",
    featuredImage: "/media/centenaire-2.jpg",
    latitude: 13.5137,
    longitude: 2.1098,
    startAt: new Date("2026-04-18T09:00:00+01:00"),
    gallery: [],
  },
  {
    id: "demo-event-2",
    slug: "journee-citoyenne-salubrite-inter-quartiers",
    title: "Journée citoyenne de salubrité inter-quartiers",
    detail: "Mobilisation simultanée des quartiers pour nettoyage, tri et sensibilisation.",
    content: null,
    location: "5 arrondissements de Niamey",
    featuredImage: "/media/municipalite-2.jpg",
    latitude: 13.526,
    longitude: 2.116,
    startAt: new Date("2026-05-11T06:30:00+01:00"),
    gallery: [],
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
        content: true,
        location: true,
        featuredImage: true,
        latitude: true,
        longitude: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        startAt: true,
        endAt: true,
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

export async function getAllEvents(limit = 50): Promise<MunicipalEvent[]> {
  if (!process.env.DATABASE_URL) {
    return demoEvents;
  }

  try {
    const rows = await prisma.event.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { startAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        detail: true,
        content: true,
        location: true,
        featuredImage: true,
        latitude: true,
        longitude: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        startAt: true,
        endAt: true,
      },
    });

    if (rows.length === 0) {
      return demoEvents;
    }

    return rows;
  } catch {
    return demoEvents;
  }
}

export async function getEventBySlug(slug: string): Promise<MunicipalEvent | null> {
  if (!process.env.DATABASE_URL) {
    return demoEvents.find((event) => event.slug === slug) ?? null;
  }

  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        gallery: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!event || event.status !== ContentStatus.PUBLISHED) {
      return demoEvents.find((e) => e.slug === slug) ?? null;
    }

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      detail: event.detail,
      content: event.content,
      location: event.location,
      featuredImage: event.featuredImage,
      latitude: event.latitude,
      longitude: event.longitude,
      seoTitle: event.seoTitle,
      seoDescription: event.seoDescription,
      seoKeywords: event.seoKeywords,
      startAt: event.startAt,
      endAt: event.endAt,
      gallery: event.gallery.map((img) => ({
        id: img.id,
        imagePath: img.imagePath,
        caption: img.caption,
      })),
    };
  } catch {
    return demoEvents.find((e) => e.slug === slug) ?? null;
  }
}
