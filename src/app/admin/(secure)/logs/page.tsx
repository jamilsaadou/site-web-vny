import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getLogs() {
  if (!process.env.DATABASE_URL) {
    return { rows: [], dbConfigured: false };
  }

  try {
    const rows = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return { rows, dbConfigured: true };
  } catch {
    return { rows: [], dbConfigured: false };
  }
}

export default async function AdminLogsPage() {
  await requireAdmin();
  const data = await getLogs();

  return (
    <div className="space-y-6">
      {!data.dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez `DATABASE_URL` pour consulter les logs.
        </div>
      ) : null}

      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-xl font-extrabold text-[var(--green-deep)]">Logs d&apos;activité</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Traçabilité des actions de l&apos;administration (connexion, création, modification, suppression).
        </p>
      </section>

      <section className="space-y-2">
        {data.rows.map((log) => (
          <div key={log.id} className="soft-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--green-deep)]">
                {log.action} - {log.entityType}
              </p>
              <span className="text-xs text-[var(--muted)]">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Acteur: {log.actorName} ({log.actorRole})
            </p>
            {log.entityId ? <p className="mt-1 text-xs text-[var(--muted)]">ID entité: {log.entityId}</p> : null}
            {log.details ? <p className="mt-2 text-sm text-[var(--text)]">{log.details}</p> : null}
          </div>
        ))}
      </section>
    </div>
  );
}
