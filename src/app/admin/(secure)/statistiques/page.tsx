import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageViewRow = {
  path: string;
  createdAt: Date;
  visitorId: string | null;
  sessionId: string;
  referrer: string | null;
  deviceType: string | null;
  browser: string | null;
};

type RankedItem = {
  label: string;
  count: number;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, amount: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rankBy(items: string[], limit = 8): RankedItem[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function referrerLabel(referrer: string | null) {
  if (!referrer) {
    return "Accès direct";
  }

  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Autre";
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function percentage(count: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.max(4, Math.round((count / total) * 100));
}

async function getAnalyticsData() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const now = new Date();
  const today = startOfDay(now);
  const since7Days = addDays(today, -6);
  const since30Days = addDays(today, -29);
  const upcomingBoundary = now;

  try {
    const [
      totalViews,
      recentViews,
      actualitesPublished,
      actualitesDraft,
      eventsPublished,
      upcomingEvents,
      pastEvents,
      mediaCount,
      messagesCount,
    ] = await Promise.all([
      prisma.sitePageView.count(),
      prisma.sitePageView.findMany({
        where: { createdAt: { gte: since30Days } },
        orderBy: { createdAt: "desc" },
        take: 50000,
        select: {
          path: true,
          createdAt: true,
          visitorId: true,
          sessionId: true,
          referrer: true,
          deviceType: true,
          browser: true,
        },
      }),
      prisma.actualite.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.actualite.count({ where: { status: ContentStatus.DRAFT } }),
      prisma.event.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.event.count({ where: { status: ContentStatus.PUBLISHED, startAt: { gte: upcomingBoundary } } }),
      prisma.event.count({ where: { status: ContentStatus.PUBLISHED, startAt: { lt: upcomingBoundary } } }),
      prisma.mediaAsset.count(),
      prisma.contactMessage.count(),
    ]);

    return {
      totalViews,
      recentViews,
      actualitesPublished,
      actualitesDraft,
      eventsPublished,
      upcomingEvents,
      pastEvents,
      mediaCount,
      messagesCount,
      today,
      since7Days,
      since30Days,
    };
  } catch {
    return null;
  }
}

function buildDailySeries(rows: PageViewRow[], since: Date, days: number) {
  const counts = new Map<string, number>();
  for (let index = 0; index < days; index += 1) {
    counts.set(dayKey(addDays(since, index)), 0);
  }

  for (const row of rows) {
    const key = dayKey(row.createdAt);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

export default async function AdminStatistiquesPage() {
  const data = await getAnalyticsData();

  if (!data) {
    return (
      <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
        Les statistiques ne sont pas encore disponibles. Vérifiez `DATABASE_URL`, puis exécutez `npm run db:push` sur le serveur.
      </div>
    );
  }

  const viewsToday = data.recentViews.filter((view) => view.createdAt >= data.today).length;
  const views7Days = data.recentViews.filter((view) => view.createdAt >= data.since7Days).length;
  const views30Days = data.recentViews.length;
  const uniqueVisitors30Days = new Set(data.recentViews.map((view) => view.visitorId).filter(Boolean)).size;
  const sessions30Days = new Set(data.recentViews.map((view) => view.sessionId)).size;
  const topPages = rankBy(data.recentViews.map((view) => view.path));
  const deviceStats = rankBy(data.recentViews.map((view) => view.deviceType ?? "Autre"), 5);
  const browserStats = rankBy(data.recentViews.map((view) => view.browser ?? "Autre"), 5);
  const referrerStats = rankBy(data.recentViews.map((view) => referrerLabel(view.referrer)), 6);
  const dailySeries = buildDailySeries(data.recentViews, data.since7Days, 7);
  const maxDailyViews = Math.max(...dailySeries.map((item) => item.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange-strong)]">Analytics</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[var(--green-deep)]">Statistiques globales du site</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Données collectées depuis les pages publiques du portail. Les pages admin ne sont pas suivies.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Vues totales</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{formatNumber(data.totalViews)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{formatNumber(views30Days)} sur 30 jours</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Visiteurs uniques</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{formatNumber(uniqueVisitors30Days)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">30 derniers jours</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Sessions</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{formatNumber(sessions30Days)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">30 derniers jours</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Aujourd&apos;hui</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{formatNumber(viewsToday)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{formatNumber(views7Days)} vues sur 7 jours</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Articles publiés</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">{formatNumber(data.actualitesPublished)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{formatNumber(data.actualitesDraft)} brouillons</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Événements publiés</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">{formatNumber(data.eventsPublished)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{formatNumber(data.upcomingEvents)} à venir</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Événements passés</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">{formatNumber(data.pastEvents)}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Médias</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">{formatNumber(data.mediaCount)}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Messages</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">{formatNumber(data.messagesCount)}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="soft-card p-5">
          <h2 className="text-lg font-extrabold text-[var(--green-deep)]">Tendance sur 7 jours</h2>
          <div className="mt-5 grid h-64 grid-cols-7 items-end gap-3">
            {dailySeries.map((item) => {
              const height = Math.max(8, Math.round((item.count / maxDailyViews) * 100));
              const date = new Date(`${item.date}T00:00:00`);

              return (
                <div key={item.date} className="flex h-full flex-col justify-end gap-2">
                  <div className="rounded-t-lg bg-[var(--green-deep)]" style={{ height: `${height}%` }} />
                  <div className="text-center">
                    <p className="text-xs font-bold text-[var(--green-deep)]">{formatNumber(item.count)}</p>
                    <p className="text-[10px] uppercase text-[var(--muted)]">
                      {new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="soft-card p-5">
          <h2 className="text-lg font-extrabold text-[var(--green-deep)]">Pages les plus vues</h2>
          <div className="mt-4 space-y-3">
            {topPages.length > 0 ? (
              topPages.map((page) => (
                <div key={page.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-semibold text-[var(--green-deep)]">{page.label}</span>
                    <span className="text-xs text-[var(--muted)]">{formatNumber(page.count)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[rgba(19,136,74,0.09)]">
                    <div className="h-full rounded-full bg-[var(--orange-strong)]" style={{ width: `${percentage(page.count, views30Days)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">Aucune vue enregistrée pour le moment.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { title: "Appareils", items: deviceStats },
          { title: "Navigateurs", items: browserStats },
          { title: "Sources", items: referrerStats },
        ].map((group) => (
          <section key={group.title} className="soft-card p-5">
            <h2 className="text-lg font-extrabold text-[var(--green-deep)]">{group.title}</h2>
            <div className="mt-4 space-y-3">
              {group.items.length > 0 ? (
                group.items.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-[var(--green-deep)]">{item.label}</span>
                      <span className="text-xs text-[var(--muted)]">{formatNumber(item.count)}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[rgba(19,136,74,0.09)]">
                      <div className="h-full rounded-full bg-[var(--green-deep)]" style={{ width: `${percentage(item.count, views30Days)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">Aucune donnée.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
