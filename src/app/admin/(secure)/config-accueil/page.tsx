import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { AdminImageUploadInput } from "@/components/admin-image-upload-input";
import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload-image";

export const dynamic = "force-dynamic";

type ConfigAccueilPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

async function updateHomepageConfigAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const heroBadge = String(formData.get("heroBadge") ?? "").trim();
  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "").trim();
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const seoKeywords = String(formData.get("seoKeywords") ?? "").trim();

  if (!heroBadge || !heroTitle || !heroSubtitle) {
    redirect("/admin/config-accueil?error=missing");
  }

  await prisma.homepageConfig.upsert({
    where: { id: "main" },
    update: { heroBadge, heroTitle, heroSubtitle, seoTitle: seoTitle || null, seoDescription: seoDescription || null, seoKeywords: seoKeywords || null },
    create: { id: "main", heroBadge, heroTitle, heroSubtitle, seoTitle: seoTitle || null, seoDescription: seoDescription || null, seoKeywords: seoKeywords || null },
  });

  await logAdminActivity({ action: "update", entityType: "homepage_config", entityId: "main", details: "Mise à jour de la configuration d'accueil" });

  revalidatePath("/");
  revalidatePath("/admin/config-accueil");
  redirect("/admin/config-accueil?status=config-updated");
}

async function createSliderItemAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(String(formData.get("sortOrder") ?? "0"));
  const isActive = String(formData.get("isActive") ?? "") === "on";

  const imageFile = formData.get("imageFile");
  let imagePath = "";
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = (await saveUploadedImage(imageFile, "slider")) ?? "";
    } catch {
      redirect("/admin/config-accueil?error=image-upload");
    }
  }

  if (!title || !description || !imagePath) {
    redirect("/admin/config-accueil?error=slider-missing");
  }

  const slider = await prisma.sliderItem.create({
    data: { title, description, imagePath, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0, isActive },
  });

  await logAdminActivity({ action: "create", entityType: "slider_item", entityId: slider.id, details: `Création slide: ${title}` });

  revalidatePath("/");
  revalidatePath("/admin/config-accueil");
  redirect("/admin/config-accueil?status=slider-created");
}

async function updateSliderItemAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const currentImagePath = String(formData.get("currentImagePath") ?? "").trim();
  const sortOrder = Number(String(formData.get("sortOrder") ?? "0"));
  const isActive = String(formData.get("isActive") ?? "") === "on";

  const imageFile = formData.get("imageFile");
  let imagePath = currentImagePath;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = (await saveUploadedImage(imageFile, "slider")) ?? currentImagePath;
    } catch {
      redirect("/admin/config-accueil?error=image-upload");
    }
  }

  if (!id || !title || !description || !imagePath) {
    redirect("/admin/config-accueil?error=slider-missing");
  }

  await prisma.sliderItem.update({
    where: { id },
    data: { title, description, imagePath, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0, isActive },
  });

  await logAdminActivity({ action: "update", entityType: "slider_item", entityId: id, details: `Mise à jour slide: ${title}` });

  revalidatePath("/");
  revalidatePath("/admin/config-accueil");
  redirect("/admin/config-accueil?status=slider-updated");
}

async function deleteSliderItemAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/config-accueil?error=slider-delete");

  await prisma.sliderItem.delete({ where: { id } });

  await logAdminActivity({ action: "delete", entityType: "slider_item", entityId: id, details: "Suppression slide" });

  revalidatePath("/");
  revalidatePath("/admin/config-accueil");
  redirect("/admin/config-accueil?status=slider-deleted");
}

async function getConfigData() {
  if (!process.env.DATABASE_URL) {
    return { dbConfigured: false, config: null, sliders: [] };
  }
  try {
    const [config, sliders] = await Promise.all([
      prisma.homepageConfig.findUnique({ where: { id: "main" } }),
      prisma.sliderItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    ]);
    return { dbConfigured: true, config, sliders };
  } catch {
    return { dbConfigured: false, config: null, sliders: [] };
  }
}

const inputClass =
  "w-full rounded-lg border border-[#d8dde3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[rgba(19,136,74,0.45)] focus:ring-1 focus:ring-[rgba(19,136,74,0.15)]";
const labelClass = "block text-xs font-semibold text-[#475467] mb-1";

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="soft-card overflow-hidden">
      <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
        <h2 className="text-base font-bold text-[#111827]">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-[#667085]">{description}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default async function AdminConfigAccueilPage({ searchParams }: ConfigAccueilPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const data = await getConfigData();

  const statusMessages: Record<string, string> = {
    "config-updated": "Configuration hero mise à jour.",
    "slider-created": "Slide ajouté avec succès.",
    "slider-updated": "Slide modifié avec succès.",
    "slider-deleted": "Slide supprimé.",
  };

  const errorMessages: Record<string, string> = {
    "missing": "Les champs badge, titre et message sont obligatoires.",
    "slider-missing": "Titre, description et image sont obligatoires pour un slide.",
    "image-upload": "Erreur lors de l'upload de l'image.",
    "slider-delete": "Impossible de supprimer ce slide.",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Page d&apos;accueil</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Configurez le contenu affiché sur la page d&apos;accueil : hero, diaporama et SEO.
        </p>
      </div>

      {!data.dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez <code className="font-mono">DATABASE_URL</code> pour gérer la configuration d&apos;accueil.
        </div>
      ) : null}

      {params.status && statusMessages[params.status] ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          {statusMessages[params.status]}
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          {errorMessages[params.error] ?? `Erreur : ${params.error}`}
        </p>
      ) : null}

      {!data.dbConfigured ? null : (
        <>
          {/* ── Section Hero ── */}
          <SectionCard title="Section Hero" description="Bandeau principal affiché en haut de la page d'accueil.">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

              {/* Form */}
              <form action={updateHomepageConfigAction} className="space-y-4">
                <div>
                  <label className={labelClass}>Badge / Étiquette</label>
                  <input
                    name="heroBadge"
                    defaultValue={data.config?.heroBadge ?? "Ville de Niamey"}
                    placeholder="Ville de Niamey"
                    required
                    className={inputClass}
                  />
                  <p className="mt-1 text-[11px] text-[#98a2b3]">Petit texte affiché en bandeau au-dessus du titre.</p>
                </div>
                <div>
                  <label className={labelClass}>Titre principal</label>
                  <textarea
                    name="heroTitle"
                    defaultValue={data.config?.heroTitle ?? ""}
                    placeholder="Bienvenue à Niamey"
                    required
                    rows={2}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Message / Sous-titre</label>
                  <textarea
                    name="heroSubtitle"
                    defaultValue={data.config?.heroSubtitle ?? ""}
                    placeholder="La capitale du Niger vous accueille…"
                    required
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <details className="rounded-lg border border-[#eaecf0]">
                  <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-[#475467] hover:bg-[#f8fafc]">
                    SEO (optionnel)
                  </summary>
                  <div className="space-y-3 border-t border-[#eaecf0] p-4">
                    <div>
                      <label className={labelClass}>Titre SEO</label>
                      <input name="seoTitle" defaultValue={data.config?.seoTitle ?? ""} placeholder="Ville de Niamey – Site officiel" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Mots-clés SEO</label>
                      <input name="seoKeywords" defaultValue={data.config?.seoKeywords ?? ""} placeholder="niamey, niger, mairie…" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Description SEO</label>
                      <textarea name="seoDescription" defaultValue={data.config?.seoDescription ?? ""} rows={3} className={inputClass} />
                    </div>
                  </div>
                </details>

                <div>
                  <button type="submit" className="btn-primary px-5 py-2.5 text-sm font-semibold">
                    Enregistrer le hero
                  </button>
                </div>
              </form>

              {/* Live preview */}
              <div className="shrink-0">
                <p className="mb-2 text-xs font-semibold text-[#475467]">Aperçu</p>
                <div className="overflow-hidden rounded-xl border border-[#d8dde3] bg-gradient-to-br from-[#0c1a11] via-[#14532d] to-[#052e16]">
                  <div className="px-5 py-7 text-center">
                    <span className="inline-block rounded-full border border-[rgba(125,224,168,0.35)] bg-[rgba(19,136,74,0.3)] px-3 py-1 text-[11px] font-semibold text-[#7de0a8]">
                      {data.config?.heroBadge || "Badge"}
                    </span>
                    <p className="mt-3 text-sm font-bold leading-snug text-white">
                      {data.config?.heroTitle || "Titre principal"}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-[rgba(255,255,255,0.65)]">
                      {data.config?.heroSubtitle
                        ? data.config.heroSubtitle.length > 120
                          ? `${data.config.heroSubtitle.slice(0, 120)}…`
                          : data.config.heroSubtitle
                        : "Message principal"}
                    </p>
                  </div>
                  <div className="border-t border-[rgba(255,255,255,0.07)] py-2 text-center text-[10px] text-[rgba(255,255,255,0.2)]">
                    Aperçu section hero
                  </div>
                </div>
              </div>

            </div>
          </SectionCard>

          {/* ── Section Ajouter un slide ── */}
          <SectionCard title="Ajouter un slide" description="Chaque slide est affiché dans le diaporama en page d'accueil.">
            <form action={createSliderItemAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Titre du slide</label>
                  <input name="title" placeholder="Ex : Niamey, ville verte" required className={inputClass} />
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className={labelClass}>Ordre d&apos;affichage</label>
                    <input type="number" name="sortOrder" defaultValue={0} className={inputClass} />
                  </div>
                  <label className="mb-2 flex items-center gap-2 text-sm text-[#475467]">
                    <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-[#16a350]" />
                    Actif
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea name="description" placeholder="Courte description affichée dans le slide…" required rows={2} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <AdminImageUploadInput name="imageFile" label="Image du slide" required />
                  <p className="mt-1 text-[11px] text-[#98a2b3]">Format paysage recommandé (16/9). PNG ou JPEG.</p>
                </div>
              </div>
              <button type="submit" className="btn-primary px-5 py-2.5 text-sm font-semibold">
                Ajouter le slide
              </button>
            </form>
          </SectionCard>

          {/* ── Slides existants ── */}
          {data.sliders.length > 0 ? (
            <SectionCard
              title={`Diaporama (${data.sliders.length} slide${data.sliders.length > 1 ? "s" : ""})`}
              description="Cliquez sur un slide pour modifier son contenu ou le supprimer."
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.sliders.map((slider) => (
                  <details key={slider.id} className="group overflow-hidden rounded-xl border border-[#e4e7ec] bg-white shadow-sm">
                    <summary className="cursor-pointer list-none">
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-[#f0f2f5]">
                        <img
                          src={slider.imagePath}
                          alt={slider.title}
                          className="h-full w-full object-cover transition group-open:opacity-60"
                          onError={undefined}
                        />
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3">
                          <div className="flex w-full items-end justify-between gap-2">
                            <p className="text-xs font-semibold leading-tight text-white drop-shadow">{slider.title}</p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                slider.isActive
                                  ? "bg-[rgba(19,136,74,0.85)] text-white"
                                  : "bg-[rgba(0,0,0,0.5)] text-[rgba(255,255,255,0.7)]"
                              }`}
                            >
                              {slider.isActive ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </div>
                        <div className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition group-hover:opacity-100">
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8zM10 4l2 2" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-[#f0f2f5] px-3 py-2">
                        <p className="text-[11px] text-[#667085]">Ordre : {slider.sortOrder}</p>
                        <p className="text-[10px] font-semibold text-[#16a350] group-open:hidden">Modifier ↓</p>
                      </div>
                    </summary>

                    {/* Edit form */}
                    <div className="border-t border-[#eaecf0] bg-[#f8fafc] p-4">
                      <p className="mb-3 text-xs font-bold text-[#344054]">Modifier ce slide</p>
                      <form action={updateSliderItemAction} className="space-y-3">
                        <input type="hidden" name="id" value={slider.id} />
                        <input type="hidden" name="currentImagePath" value={slider.imagePath} />
                        <div>
                          <label className={labelClass}>Titre</label>
                          <input name="title" defaultValue={slider.title} required className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Description</label>
                          <textarea name="description" defaultValue={slider.description} required rows={2} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Remplacer l&apos;image (optionnel)</label>
                          <AdminImageUploadInput name="imageFile" defaultPreview={slider.imagePath} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className={labelClass}>Ordre</label>
                            <input type="number" name="sortOrder" defaultValue={slider.sortOrder} className={inputClass} />
                          </div>
                          <label className="mt-4 flex items-center gap-2 text-sm text-[#475467]">
                            <input type="checkbox" name="isActive" defaultChecked={slider.isActive} className="h-4 w-4 accent-[#16a350]" />
                            Actif
                          </label>
                        </div>
                        <button type="submit" className="btn-primary w-full py-2 text-sm font-semibold">
                          Enregistrer les modifications
                        </button>
                      </form>

                      <AdminDeleteDialog message="Supprimer définitivement ce slide ?">
                        <form action={deleteSliderItemAction} className="mt-2">
                          <input type="hidden" name="id" value={slider.id} />
                          <button
                            type="submit"
                            className="w-full rounded-lg border border-[rgba(214,101,0,0.35)] bg-transparent px-4 py-2 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.1)]"
                          >
                            Supprimer ce slide
                          </button>
                        </form>
                      </AdminDeleteDialog>
                    </div>
                  </details>
                ))}
              </div>
            </SectionCard>
          ) : (
            <div className="soft-card flex flex-col items-center justify-center gap-2 py-12 text-center">
              <svg viewBox="0 0 48 48" className="h-10 w-10 text-[#d0d5dd]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="6" y="12" width="36" height="26" rx="3" />
                <path d="M6 20h36" />
                <circle cx="18" cy="30" r="3" />
                <path d="M6 38l9-7 6 5 5-4 10 7" />
              </svg>
              <p className="text-sm font-medium text-[#667085]">Aucun slide pour l&apos;instant</p>
              <p className="text-xs text-[#98a2b3]">Ajoutez votre premier slide via le formulaire ci-dessus.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
