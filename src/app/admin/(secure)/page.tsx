import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  if (!process.env.DATABASE_URL) {
    return {
      actualites: 0,
      evenements: 0,
      messages: 0,
      utilisateurs: 0,
      medias: 0,
      logs: 0,
      latestMessageAt: null as Date | null,
      dbConfigured: false,
    };
  }

  try {
    const [actualites, evenements, messages, utilisateurs, medias, logs, latestMessage] = await Promise.all([
      prisma.actualite.count(),
      prisma.event.count(),
      prisma.contactMessage.count(),
      prisma.adminUser.count(),
      prisma.mediaAsset.count(),
      prisma.activityLog.count(),
      prisma.contactMessage.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return {
      actualites,
      evenements,
      messages,
      utilisateurs,
      medias,
      logs,
      latestMessageAt: latestMessage?.createdAt ?? null,
      dbConfigured: true,
    };
  } catch {
    return {
      actualites: 0,
      evenements: 0,
      messages: 0,
      utilisateurs: 0,
      medias: 0,
      logs: 0,
      latestMessageAt: null as Date | null,
      dbConfigured: false,
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      {!stats.dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez `DATABASE_URL` puis lancez `npm run db:generate` et `npm run db:push`.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Actualités publiées</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{stats.actualites}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Événements à l&apos;agenda</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{stats.evenements}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Messages citoyens</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{stats.messages}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Dernier reçu:{" "}
            {stats.latestMessageAt
              ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(stats.latestMessageAt)
              : "n/a"}
          </p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Utilisateurs admin</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{stats.utilisateurs}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Médias importés</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{stats.medias}</p>
        </div>
        <div className="soft-card p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Logs d&apos;activité</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--green-deep)]">{stats.logs}</p>
        </div>
      </div>

      <div className="soft-card p-5">
        <h2 className="text-xl font-extrabold text-[var(--green-deep)]">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/actualites" className="btn-primary px-5 py-2 text-sm">
            Gérer les actualités
          </Link>
          <Link href="/admin/evenements" className="btn-ghost px-5 py-2 text-sm">
            Gérer les événements
          </Link>
          <Link href="/admin/config-accueil" className="btn-ghost px-5 py-2 text-sm">
            Configurer l&apos;accueil
          </Link>
          <Link href="/admin/config-centenaire" className="btn-ghost px-5 py-2 text-sm">
            Configurer le centenaire
          </Link>
          <Link href="/admin/media" className="btn-ghost px-5 py-2 text-sm">
            Gérer les médias
          </Link>
          <Link href="/admin/utilisateurs" className="btn-ghost px-5 py-2 text-sm">
            Gérer les utilisateurs
          </Link>
          <Link href="/admin/logs" className="btn-ghost px-5 py-2 text-sm">
            Voir les logs
          </Link>
          <Link href="/admin/messages" className="btn-ghost px-5 py-2 text-sm">
            Lire les messages
          </Link>
        </div>
      </div>
    </div>
  );
}
