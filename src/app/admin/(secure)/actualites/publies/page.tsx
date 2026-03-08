import { ContentStatus, NewsCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminActualitesPublieesPageProps = {
  searchParams: Promise<{ status?: string; error?: string; filter?: string }>;
};

const categoryLabels = new Map<NewsCategory, string>([
  [NewsCategory.ACTUALITE, "Actualité"],
  [NewsCategory.NANEYE_YARDA, "Naneye Yarda"],
  [NewsCategory.CENTENAIRE, "Le centenaire"],
]);

async function deleteActualiteAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/actualites/publies?error=delete");
  }

  try {
    await prisma.actualite.delete({ where: { id } });
  } catch {
    redirect("/admin/actualites/publies?error=delete");
  }

  await logAdminActivity({
    action: "delete",
    entityType: "actualite",
    entityId: id,
    details: "Suppression actualité",
  });

  revalidatePath("/");
  revalidatePath("/actualite");
  revalidatePath("/admin");
  revalidatePath("/admin/actualites");
  revalidatePath("/admin/actualites/publies");
  redirect("/admin/actualites/publies?status=deleted");
}

async function toggleActualiteStatusAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  const currentStatus = String(formData.get("currentStatus") ?? "").trim();
  if (!id) {
    redirect("/admin/actualites/publies?error=toggle");
  }

  const newStatus =
    currentStatus === ContentStatus.PUBLISHED ? ContentStatus.DRAFT : ContentStatus.PUBLISHED;

  try {
    await prisma.actualite.update({ where: { id }, data: { status: newStatus } });
  } catch {
    redirect("/admin/actualites/publies?error=toggle");
  }

  await logAdminActivity({
    action: "update",
    entityType: "actualite",
    entityId: id,
    details: `Statut basculé → ${newStatus}`,
  });

  revalidatePath("/");
  revalidatePath("/actualite");
  revalidatePath("/admin/actualites/publies");
  redirect("/admin/actualites/publies?status=toggled");
}

async function getAllActualites(filter: string) {
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
      prisma.actualite.findMany({
        orderBy: { publishedAt: "desc" },
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          status: true,
          publishedAt: true,
          location: true,
          featuredImage: true,
          _count: {
            select: { gallery: true },
          },
        },
      }),
      prisma.actualite.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.actualite.count({ where: { status: ContentStatus.DRAFT } }),
    ]);
    return { rows, dbConfigured: true, publishedCount, draftCount };
  } catch {
    return { rows: [], dbConfigured: false, publishedCount: 0, draftCount: 0 };
  }
}

export default async function AdminActualitesPublieesPage({ searchParams }: AdminActualitesPublieesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const filter = params.filter ?? "";
  const { rows, dbConfigured, publishedCount, draftCount } = await getAllActualites(filter);
  const publicationFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

  const filterTabs = [
    { label: `Tous (${publishedCount + draftCount})`, value: "" },
    { label: `Publiés (${publishedCount})`, value: "published" },
    { label: `Brouillons (${draftCount})`, value: "draft" },
  ];

  return (
    <div className="space-y-6">
      {!dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez `DATABASE_URL` pour activer la gestion des actualités.
        </div>
      ) : null}

      {params.status ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          {params.status === "toggled" ? "Statut de l'article mis à jour." : `Opération réalisée: ${params.status}.`}
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
            <h2 className="text-base font-semibold uppercase tracking-[0.08em] text-[#344054]">Tous les articles</h2>
            <p className="text-xs text-[#667085]">Gérez et publiez vos articles depuis cette liste.</p>
          </div>
          <Link href="/admin/actualites" className="btn-primary px-4 py-2 text-xs">
            Nouvel article
          </Link>
        </div>

        <div className="flex gap-1 border-b border-[#e5e8eb] bg-[#f8fafc] px-5 py-0">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/actualites/publies?filter=${tab.value}` : "/admin/actualites/publies"}
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
          <p className="px-5 py-6 text-sm text-[#667085]">Aucun article dans cette catégorie.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8fafc] text-left text-xs uppercase tracking-[0.06em] text-[#667085]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Article</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Publication</th>
                  <th className="px-4 py-3 font-semibold">Lieu</th>
                  <th className="px-4 py-3 font-semibold">Galerie</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {rows.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-[#fafbfc]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.featuredImage ? (
                          <img src={item.featuredImage} alt={item.title} className="h-11 w-16 rounded object-cover" />
                        ) : (
                          <span className="inline-flex h-11 w-16 items-center justify-center rounded border border-dashed border-[#d0d5dd] text-[10px] text-[#98a2b3]">
                            Sans image
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827]">{item.title}</p>
                          <p className="truncate text-xs text-[#667085]">/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === ContentStatus.PUBLISHED ? (
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
                    <td className="px-4 py-3 text-xs text-[#475467]">{categoryLabels.get(item.category) ?? item.category}</td>
                    <td className="px-4 py-3 text-xs text-[#475467]">{publicationFormatter.format(item.publishedAt)}</td>
                    <td className="px-4 py-3 text-xs text-[#475467]">{item.location}</td>
                    <td className="px-4 py-3 text-xs text-[#475467]">{item._count.gallery} image(s)</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/actualites?edit=${item.id}`}
                          className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:bg-[#eef2f7]"
                        >
                          Modifier
                        </Link>
                        {item.status === ContentStatus.PUBLISHED ? (
                          <Link
                            href={`/actualite/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-[rgba(19,136,74,0.35)] bg-[rgba(19,136,74,0.1)] px-3 py-1.5 text-xs font-semibold text-[var(--green-deep)] transition hover:bg-[rgba(19,136,74,0.16)]"
                          >
                            Voir
                          </Link>
                        ) : null}
                        <form action={toggleActualiteStatusAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="currentStatus" value={item.status} />
                          <button
                            type="submit"
                            className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:bg-[#eef2f7]"
                          >
                            {item.status === ContentStatus.PUBLISHED ? "Dépublier" : "Publier"}
                          </button>
                        </form>
                        <AdminDeleteDialog message="Supprimer définitivement cet article ?">
                          <form action={deleteActualiteAction}>
                            <input type="hidden" name="id" value={item.id} />
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
