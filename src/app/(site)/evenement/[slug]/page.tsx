import Image from "next/image";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBlockRenderer } from "@/components/article-block-renderer";
import { EventCountdown } from "@/components/event-countdown";
import { Reveal } from "@/components/reveal";
import { getEventBySlug, getAllEvents } from "@/lib/events";
import { formatFrenchDate, isUploadedAssetPath } from "@/lib/utils";

type EvenementDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EvenementDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return {
      title: "Événement introuvable | Ville de Niamey",
      description: "Cet événement n'est plus disponible.",
    };
  }

  const headerStore = await headers();
  const origin = getRequestOrigin(headerStore);
  const eventUrl = `${origin}/evenement/${event.slug}`;
  const title = event.seoTitle || `${event.title} | Ville de Niamey`;
  const description = event.seoDescription || event.detail;
  const imagePath = event.featuredImage || event.gallery?.[0]?.imagePath;
  const imageUrl = imagePath ? toAbsoluteUrl(origin, imagePath) : undefined;

  return {
    title,
    description,
    keywords: event.seoKeywords || "événement niamey, mairie",
    openGraph: {
      title,
      description,
      url: eventUrl,
      siteName: "Ville de Niamey",
      type: "article",
      publishedTime: event.startAt.toISOString(),
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1600,
              height: 1000,
              alt: event.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const items = await getAllEvents(30);
  return items.map((item) => ({ slug: item.slug }));
}

function formatEventTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Niamey",
  });
}

function getRequestOrigin(headerStore: Headers) {
  const forwardedHost = headerStore.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headerStore.get("host")?.split(",")[0]?.trim() || "localhost:3000";
  const forwardedProto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

function toAbsoluteUrl(origin: string, path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function getOsmMapData(latitude: number, longitude: number) {
  const delta = 0.012;
  const west = longitude - delta;
  const south = latitude - delta;
  const east = longitude + delta;
  const north = latitude + delta;
  const bbox = [west, south, east, north].map((value) => value.toFixed(6)).join("%2C");
  const marker = `${latitude.toFixed(6)}%2C${longitude.toFixed(6)}`;

  return {
    embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`,
    viewUrl: `https://www.openstreetmap.org/?mlat=${latitude.toFixed(6)}&mlon=${longitude.toFixed(6)}#map=17/${latitude.toFixed(6)}/${longitude.toFixed(6)}`,
    googleUrl: `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`,
  };
}

export default async function EvenementDetailPage({ params }: EvenementDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const heroImage = event.featuredImage || event.gallery?.[0]?.imagePath;
  const now = new Date();
  const eventHasStarted = new Date(event.startAt) <= now;
  const eventIsPast = new Date(event.endAt ?? event.startAt) < now;
  const eventStatusLabel = eventIsPast ? "Événement passé" : eventHasStarted ? "En cours" : "À venir";
  const latitude = event.latitude;
  const longitude = event.longitude;
  const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";
  const mapData = hasCoordinates ? getOsmMapData(latitude, longitude) : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <Link href="/evenement" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hover:text-[var(--orange-strong)]">
            Événements / retour à la liste
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${eventIsPast ? "bg-gray-100 text-gray-600" : "bg-[var(--green-deep)] text-white"}`}>
              {eventStatusLabel}
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--orange-strong)]">
              {formatFrenchDate(event.startAt)} à {formatEventTime(event.startAt)}
            </p>
          </div>

          <h1 className="display-font mt-4 text-4xl leading-tight font-extrabold text-[var(--green-deep)] sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{event.detail}</p>
        </Reveal>

        {heroImage ? (
          <Reveal className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)]">
            <Image
              src={heroImage}
              alt={event.title}
              width={1600}
              height={1000}
              unoptimized={isUploadedAssetPath(heroImage)}
              className="h-auto w-full object-cover"
            />
          </Reveal>
        ) : null}

        <Reveal className="mt-8">
          <EventCountdown
            targetDate={event.startAt.toISOString()}
            title={event.title}
            location={event.location}
            eyebrow={eventIsPast ? "Événement passé" : eventHasStarted ? "Événement en cours" : "Compte à rebours"}
            completedLabel={eventIsPast ? "L'événement est terminé." : "L'événement est en cours."}
          />
        </Reveal>

        {event.content ? (
          <Reveal className="mt-10">
            <ArticleBlockRenderer content={event.content} />
          </Reveal>
        ) : null}

        <Reveal className="mt-12">
          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(14,38,27,0.12)]">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange-strong)]">Localisation</p>
                <h2 className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">Lieu de l&apos;événement</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{event.location}</p>

                {hasCoordinates ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Latitude</p>
                      <p className="mt-1 text-sm font-extrabold text-[var(--green-deep)]">{latitude.toFixed(6)}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Longitude</p>
                      <p className="mt-1 text-sm font-extrabold text-[var(--green-deep)]">{longitude.toFixed(6)}</p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[rgba(19,136,74,0.18)] bg-[rgba(19,136,74,0.08)] px-3 py-1 text-xs font-semibold text-[var(--green-deep)]">
                    Axes routiers
                  </span>
                  <span className="rounded-full border border-[rgba(19,136,74,0.18)] bg-[rgba(19,136,74,0.08)] px-3 py-1 text-xs font-semibold text-[var(--green-deep)]">
                    Points d&apos;intérêt
                  </span>
                  <span className="rounded-full border border-[rgba(19,136,74,0.18)] bg-[rgba(19,136,74,0.08)] px-3 py-1 text-xs font-semibold text-[var(--green-deep)]">
                    Quartiers
                  </span>
                  <span className="rounded-full border border-[rgba(19,136,74,0.18)] bg-[rgba(19,136,74,0.08)] px-3 py-1 text-xs font-semibold text-[var(--green-deep)]">
                    Services proches
                  </span>
                </div>

                {mapData ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={mapData.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary px-5 py-2 text-sm"
                    >
                      Ouvrir OpenStreetMap
                    </a>
                    <a
                      href={mapData.googleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost px-5 py-2 text-sm"
                    >
                      Itinéraire
                    </a>
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
                    Les coordonnées GPS seront affichées dès qu&apos;elles seront ajoutées dans le back office.
                  </p>
                )}
              </div>

              <div className="min-h-[22rem] border-t border-[var(--line)] bg-[var(--surface-soft)] lg:border-t-0 lg:border-l">
                {mapData ? (
                  <iframe
                    title={`Carte OpenStreetMap - ${event.title}`}
                    src={mapData.embedUrl}
                    className="h-[22rem] w-full border-0 lg:h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-full min-h-[22rem] items-center justify-center p-8 text-center">
                    <p className="max-w-sm text-sm leading-7 text-[var(--muted)]">
                      Ajoutez latitude et longitude dans l&apos;admin pour activer la carte.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {event.gallery && event.gallery.length > 0 ? (
          <section className="mt-12">
            <Reveal>
              <h2 className="text-2xl font-extrabold text-[var(--green-deep)]">Galerie photos</h2>
            </Reveal>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {event.gallery.map((image, index) => (
                <Reveal key={image.id} delay={index * 0.05} className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                  <Image
                    src={image.imagePath}
                    alt={image.caption || event.title}
                    width={900}
                    height={600}
                    unoptimized={isUploadedAssetPath(image.imagePath)}
                    className="h-44 w-full object-cover"
                  />
                  {image.caption ? <p className="px-3 py-2 text-xs text-[var(--muted)]">{image.caption}</p> : null}
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {/* Call to action */}
        <Reveal className="mt-12">
          <div className="rounded-2xl border border-[var(--line)] bg-gradient-to-r from-[var(--green-deep)] to-[var(--green-deep)]/90 p-8 text-center">
            <h3 className="text-xl font-bold text-white">Restez informé des prochains événements</h3>
            <p className="mt-2 text-sm text-white/80">
              Suivez l&apos;actualité de la Ville de Niamey pour ne manquer aucun événement municipal.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/evenement"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[var(--green-deep)] transition hover:bg-white/90"
              >
                Tous les événements
              </Link>
              <Link
                href="/actualite"
                className="rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Voir l&apos;actualité
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
