import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminEvenementsPubliesPageProps = {
  searchParams: Promise<{ status?: string; error?: string; filter?: string }>;
};

async function deleteEventAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/evenements/publies?error=delete");
  }

  try {
    await prisma.event.delete({ where: { id } });
  } catch {
    redirect("/admin/evenements/publies?error=delete");
  }

  await logAdminActivity({
    action: "delete",
    entityType: "event",
    entityId: id,
    details: "Suppression événement",
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/evenements");
  revalidatePath("/admin/evenements/publies");
  redirect("/admin/evenements/publies?status=deleted");
}

async function toggleEventStatusAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  const currentStatus = String(formData.get("currentStatus") ?? "").trim();
  if (!id) {
    redirect("/admin/evenements/publies?error=toggle");
  }

  const newStatus =
    currentStatus === ContentStatus.PUBLISHED ? ContentStatus.DRAFT : ContentStatus.PUBLISHED;

  try {
    await prisma.event.update({ where: { id }, data: { status: newStatus } });
  } catch {
    redirect("/admin/evenements/publies?error=toggle");
  }

  await logAdminActivity({
    action: "update",
    entityType: "event",
    entityId: id,
    details: `Statut basculé → ${newStatus}`,
  });

  revalidatePath("/");
  revalidatePath("/admin/evenements/publies");
  redirect("/admin/evenements/publies?status=toggled");
}

async function getAllEvents(filter: string) {
  if (!process.env.DATABASE_URL) {
    return { rows: [], dbConfigured: false, publishedCount: 0, draftCount: 0 };
  }

  try {
    const where =
      filter === "published"
        ? { status: ContentStatus.PUBLISHED }
        : filter === "draft"
          ? { status: ContentStatus.DRAFT }
          : undefined;

    const [rows, publishedCount, draftCount] = await Promise.all([
      prisma.event.findMany({
        orderBy: { startAt: "asc" },
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          location: true,
          startAt: true,
          status: true,
          featuredImage: true,
          _count: {
            select: { gallery: true },
          },
        },
      }),
      prisma.event.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.event.count({ where: { status: ContentStatus.DRAFT } }),
    ]);
    return { rows, dbConfigured: true, publishedCount, draftCount };
  } catch {
    return { rows: [], dbConfigured: false, publishedCount: 0, draftCount: 0 };
  }
}

export default async function AdminEvenementsPubliesPage({ searchParams }: AdminEvenementsPubliesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const filter = params.filter ?? "";
  const { rows, dbConfigured, publishedCount, draftCount } = await getAllEvents(filter);
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

  const filterTabs = [
    { label: `Tous (${publishedCount + draftCount})`, value: "" },
    { label: `Publiés (${publishedCount})`, value: "published" },
    { label: `Brouillons (${draftCount})`, value: "draft" },
  ];

  return (
    <div className="space-y-6">
      {!dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez `DATABASE_URL` pour activer la gestion des événements.
        </div>
      ) : null}

      {params.status ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          {params.status === "toggled" ? "Statut de l'événement mis à jour." : `Opération réalisée: ${params.status}.`}
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Impossible de traiter la demande ({params.error}).
        </p>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-[#d0d7de] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8eb] bg-[#f8fafc] px-5 py-3">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-[0.08em] text-[#344054]">Tous les événements</h2>
            <p className="text-xs text-[#667085]">Gérez et publiez vos événements depuis cette liste.</p>
          </div>
          <Link href="/admin/evenements" className="btn-primary px-4 py-2 text-xs">
            Nouvel événement
          </Link>
        </div>

        <div className="flex gap-1 border-b border-[#e5e8eb] bg-[#f8fafc] px-5 py-0">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/evenements/publies?filter=${tab.value}` : "/admin/evenements/publies"}
              className={`border-b-2 px-3 py-2.5 text-xs font-semibold transition ${
                filter === tab.value
                  ? "border-[var(--green-deep)] text-[var(--green-deep)]"
                  : "border-transparent text-[#667085] hover:text-[#344054]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#667085]">Aucun événement dans cette catégorie.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8fafc] text-left text-xs uppercase tracking-[0.06em] text-[#667085]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Événement</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Lieu</th>
                  <th className="px-4 py-3 font-semibold">Galerie</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {rows.map((event) => (
                  <tr key={event.id} className="bg-white hover:bg-[#fafbfc]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.featuredImage ? (
                          <img src={event.featuredImage} alt={event.title} className="h-11 w-16 rounded object-cover" />
                        ) : (
                          <span className="inline-flex h-11 w-16 items-center justify-center rounded border border-dashed border-[#d0d5dd] text-[10px] text-[#98a2b3]">
                            Sans image
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827]">{event.title}</p>
                          <p className="truncate text-xs text-[#667085]">/{event.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {event.status === ContentStatus.PUBLISHED ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(19,136,74,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[var(--green-deep)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--green-deep)]" />
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[11px] font-semibold text-[#6b7280]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af]" />
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#475467]">{dateFormatter.format(event.startAt)}</td>
                    <td className="px-4 py-3 text-xs text-[#475467]">{event.location}</td>
                    <td className="px-4 py-3 text-xs text-[#475467]">{event._count.gallery} image(s)</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/evenements?edit=${event.id}`}
                          className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:bg-[#eef2f7]"
                        >
                          Modifier
                        </Link>
                        <form action={toggleEventStatusAction}>
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="currentStatus" value={event.status} />
                          <button
                            type="submit"
                            className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:bg-[#eef2f7]"
                          >
                            {event.status === ContentStatus.PUBLISHED ? "Dépublier" : "Publier"}
                          </button>
                        </form>
                        <AdminDeleteDialog message="Supprimer définitivement cet événement ?">
                          <form action={deleteEventAction}>
                            <input type="hidden" name="id" value={event.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-[rgba(214,101,0,0.35)] bg-[rgba(240,122,20,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
                            >
                              Supprimer
                            </button>
                          </form>
                        </AdminDeleteDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
