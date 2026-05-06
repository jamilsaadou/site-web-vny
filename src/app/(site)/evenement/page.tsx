import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { getAllEvents } from "@/lib/events";
import { formatFrenchDate, isUploadedAssetPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Événements | Ville de Niamey",
  description: "Découvrez tous les événements municipaux organisés par la Ville de Niamey.",
};

export default async function EvenementListPage() {
  const events = await getAllEvents(50);

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.startAt) >= now);
  const pastEvents = events.filter((e) => new Date(e.startAt) < now);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--orange-strong)]">
            Agenda municipal
          </p>
          <h1 className="display-font mt-2 text-4xl leading-tight font-extrabold text-[var(--green-deep)] sm:text-5xl">
            Événements
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--muted)]">
            Retrouvez tous les événements organisés par la Ville de Niamey : forums, journées citoyennes,
            cérémonies et activités culturelles.
          </p>
        </Reveal>
      </section>

      {upcomingEvents.length > 0 && (
        <section className="pb-12">
          <Reveal>
            <h2 className="text-2xl font-extrabold text-[var(--green-deep)]">À venir</h2>
          </Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, index) => (
              <Reveal key={event.id} delay={index * 0.05}>
                <Link
                  href={`/evenement/${event.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition-shadow hover:shadow-lg"
                >
                  {event.featuredImage ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={event.featuredImage}
                        alt={event.title}
                        fill
                        unoptimized={isUploadedAssetPath(event.featuredImage)}
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 rounded-full bg-[var(--green-deep)] px-3 py-1 text-xs font-semibold text-white">
                        À venir
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-[var(--green-deep)] to-[var(--green-deep)]/80">
                      <span className="text-4xl font-bold text-white/30">🗓</span>
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--orange-strong)]">
                      {formatFrenchDate(event.startAt)}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-[var(--green-deep)] group-hover:text-[var(--orange-strong)] transition-colors">
                      {event.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{event.detail}</p>
                    <p className="mt-3 text-xs text-[var(--muted)]">📍 {event.location}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {pastEvents.length > 0 && (
        <section className="pb-12">
          <Reveal>
            <h2 className="text-2xl font-extrabold text-[var(--green-deep)]">Événements passés</h2>
          </Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event, index) => (
              <Reveal key={event.id} delay={index * 0.05}>
                <Link
                  href={`/evenement/${event.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition-shadow hover:shadow-lg"
                >
                  {event.featuredImage ? (
                    <div className="relative h-48 w-full overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      <Image
                        src={event.featuredImage}
                        alt={event.title}
                        fill
                        unoptimized={isUploadedAssetPath(event.featuredImage)}
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-white">
                        Passé
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500">
                      <span className="text-4xl font-bold text-white/30">🗓</span>
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                      {formatFrenchDate(event.startAt)}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-[var(--green-deep)] group-hover:text-[var(--orange-strong)] transition-colors">
                      {event.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{event.detail}</p>
                    <p className="mt-3 text-xs text-[var(--muted)]">📍 {event.location}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-soft)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--muted)]">Aucun événement pour le moment.</p>
        </div>
      )}
    </main>
  );
}
