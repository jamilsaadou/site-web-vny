import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBlockRenderer } from "@/components/article-block-renderer";
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

  return {
    title: event.seoTitle || `${event.title} | Ville de Niamey`,
    description: event.seoDescription || event.detail,
    keywords: event.seoKeywords || "événement niamey, mairie",
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

export default async function EvenementDetailPage({ params }: EvenementDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const heroImage = event.featuredImage || event.gallery?.[0]?.imagePath;
  const isPast = new Date(event.startAt) < new Date();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <Link href="/evenement" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hover:text-[var(--orange-strong)]">
            Événements / retour à la liste
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPast ? "bg-gray-100 text-gray-600" : "bg-[var(--green-deep)] text-white"}`}>
              {isPast ? "Événement passé" : "À venir"}
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--orange-strong)]">
              {formatFrenchDate(event.startAt)} à {formatEventTime(event.startAt)}
            </p>
          </div>

          <h1 className="display-font mt-4 text-4xl leading-tight font-extrabold text-[var(--green-deep)] sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{event.detail}</p>
          
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-start gap-2">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Lieu</p>
                <p className="text-sm font-medium text-[var(--green-deep)]">{event.location}</p>
              </div>
            </div>
            {event.latitude && event.longitude && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🗺️</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Coordonnées</p>
                  <a
                    href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--orange-strong)] hover:underline"
                  >
                    Voir sur Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
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

        {event.content ? (
          <Reveal className="mt-10">
            <ArticleBlockRenderer content={event.content} />
          </Reveal>
        ) : null}

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
