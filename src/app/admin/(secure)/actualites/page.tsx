import { ContentStatus, NewsCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import {
  compactArticleBlocks,
  createGalleryImage,
  getArticleBlockGalleryInputName,
  getArticleBlockImageInputName,
  parseArticleBlocks,
  serializeArticleBlocks,
} from "@/lib/article-blocks";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminBlockEditor } from "@/components/admin-block-editor";
import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { AdminImageUploadInput } from "@/components/admin-image-upload-input";
import { AdminMultiImageUploadInput } from "@/components/admin-multi-image-upload-input";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload-image";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ActualitesPageProps = {
  searchParams: Promise<{ status?: string; error?: string; edit?: string }>;
};

const categories = [
  { value: NewsCategory.ACTUALITE, label: "Actualité" },
  { value: NewsCategory.NANEYE_YARDA, label: "Naneye Yarda" },
  { value: NewsCategory.CENTENAIRE, label: "Le centenaire" },
];

const statusOptions = [
  { value: ContentStatus.PUBLISHED, label: "Publié — visible sur le site" },
  { value: ContentStatus.DRAFT, label: "Brouillon — non visible" },
];

function toDatetimeLocalValue(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function parsePublishedDate(value: FormDataEntryValue | null) {
  const input = String(value ?? "").trim();
  if (!input) {
    return new Date();
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("invalid_date");
  }

  return parsed;
}

function parseContentStatus(value: FormDataEntryValue | null): ContentStatus {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === ContentStatus.DRAFT) return ContentStatus.DRAFT;
  return ContentStatus.PUBLISHED;
}

async function hydrateArticleContent(content: string, formData: FormData, slug: string) {
  const blocks = parseArticleBlocks(content);

  for (const [index, block] of blocks.entries()) {
    if (block.type === "image") {
      const fileEntry = formData.get(getArticleBlockImageInputName(block.id));
      if (fileEntry instanceof File && fileEntry.size > 0) {
        block.url = (await saveUploadedImage(fileEntry, `${slug}-bloc-${index + 1}-image`)) ?? block.url ?? "";
      }
      continue;
    }

    if (block.type === "gallery") {
      const files = formData.getAll(getArticleBlockGalleryInputName(block.id));
      let appendIndex = block.images.length;

      for (const entry of files) {
        if (!(entry instanceof File) || entry.size === 0) {
          continue;
        }

        const imagePath = await saveUploadedImage(entry, `${slug}-bloc-${index + 1}-gallery-${appendIndex + 1}`);
        if (!imagePath) {
          continue;
        }

        block.images = [
          ...block.images,
          createGalleryImage({
            url: imagePath,
          }),
        ];
        appendIndex += 1;
      }
    }
  }

  const compacted = compactArticleBlocks(blocks);
  return compacted.length > 0 ? serializeArticleBlocks(compacted) : null;
}

async function createActualiteAction(formData: FormData) {
  "use server";

  await requireAdmin();
  if (!process.env.DATABASE_URL) {
    return redirect("/admin/actualites?error=no-database");
  }

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const featuredImageFile = formData.get("featuredImageFile");
  const galleryFiles = formData.getAll("galleryFiles");
  const location = String(formData.get("location") ?? "").trim();
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const seoKeywords = String(formData.get("seoKeywords") ?? "").trim();
  const category = String(formData.get("category") ?? NewsCategory.ACTUALITE) as NewsCategory;
  const status = parseContentStatus(formData.get("status"));

  // Track redirect destination - call redirect only at the end
  let redirectUrl = "/admin/actualites?status=created";

  if (!title || !excerpt || !location) {
    return redirect("/admin/actualites?error=missing");
  }

  const slug = slugify(slugInput || title);
  if (!slug) {
    return redirect("/admin/actualites?error=slug");
  }

  let normalizedContent: string | null = null;
  let contentError = false;
  try {
    normalizedContent = await hydrateArticleContent(content, formData, slug);
  } catch {
    contentError = true;
  }
  if (contentError) {
    return redirect("/admin/actualites?error=content-media");
  }

  let featuredImage = "";
  let imageError = false;
  if (featuredImageFile instanceof File && featuredImageFile.size > 0) {
    try {
      featuredImage = (await saveUploadedImage(featuredImageFile, `${slug}-a-la-une`)) ?? "";
    } catch {
      imageError = true;
    }
  }
  if (imageError) {
    return redirect("/admin/actualites?error=image");
  }

  let publishedAt: Date;
  let dateError = false;
  try {
    publishedAt = parsePublishedDate(formData.get("publishedAt"));
  } catch {
    dateError = true;
    publishedAt = new Date();
  }
  if (dateError) {
    return redirect("/admin/actualites?error=date");
  }

  let createdId = "";
  let createError = false;
  try {
    const created = await prisma.actualite.create({
      data: {
        title,
        slug,
        excerpt,
        content: normalizedContent,
        featuredImage: featuredImage || null,
        category,
        status,
        location,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        publishedAt,
      },
    });
    createdId = created.id;

    let sortOrder = 0;
    let firstGalleryPath = "";
    for (const fileEntry of galleryFiles) {
      if (!(fileEntry instanceof File) || fileEntry.size === 0) {
        continue;
      }

      const galleryPath = await saveUploadedImage(fileEntry, `${slug}-gallery-${sortOrder + 1}`);
      if (!galleryPath) {
        continue;
      }

      if (!firstGalleryPath) {
        firstGalleryPath = galleryPath;
      }

      await prisma.actualiteGalleryImage.create({
        data: {
          actualiteId: created.id,
          imagePath: galleryPath,
          sortOrder,
        },
      });
      sortOrder += 1;
    }

    if (!featuredImage && firstGalleryPath) {
      await prisma.actualite.update({
        where: { id: created.id },
        data: { featuredImage: firstGalleryPath },
      });
    }
  } catch {
    createError = true;
  }

  if (createError) {
    return redirect("/admin/actualites?error=create");
  }

  await logAdminActivity({
    action: "create",
    entityType: "actualite",
    entityId: createdId,
    details: `Création actualité: ${title}`,
  });

  revalidatePath("/");
  revalidatePath("/actualite");
  revalidatePath(`/actualite/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/actualites");
  return redirect(redirectUrl);
}

async function updateActualiteAction(formData: FormData) {
  "use server";

  await requireAdmin();
  if (!process.env.DATABASE_URL) {
    return redirect("/admin/actualites?error=no-database");
  }

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const currentFeaturedImage = String(formData.get("currentFeaturedImage") ?? "").trim();
  const featuredImageFile = formData.get("featuredImageFile");
  const location = String(formData.get("location") ?? "").trim();
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const seoKeywords = String(formData.get("seoKeywords") ?? "").trim();
  const category = String(formData.get("category") ?? NewsCategory.ACTUALITE) as NewsCategory;
  const status = parseContentStatus(formData.get("status"));

  if (!id || !title || !excerpt || !location) {
    return redirect("/admin/actualites?error=missing");
  }

  const slug = slugify(slugInput || title);
  if (!slug) {
    return redirect("/admin/actualites?error=slug");
  }

  let normalizedContent: string | null = null;
  let contentError = false;
  try {
    normalizedContent = await hydrateArticleContent(content, formData, slug);
  } catch {
    contentError = true;
  }
  if (contentError) {
    return redirect(`/admin/actualites?error=content-media&edit=${id}`);
  }

  let featuredImage = currentFeaturedImage;
  let imageError = false;
  if (featuredImageFile instanceof File && featuredImageFile.size > 0) {
    try {
      featuredImage = (await saveUploadedImage(featuredImageFile, `${slug}-a-la-une`)) ?? currentFeaturedImage;
    } catch {
      imageError = true;
    }
  }
  if (imageError) {
    return redirect("/admin/actualites?error=image");
  }

  let publishedAt: Date;
  let dateError = false;
  try {
    publishedAt = parsePublishedDate(formData.get("publishedAt"));
  } catch {
    dateError = true;
    publishedAt = new Date();
  }
  if (dateError) {
    return redirect("/admin/actualites?error=date");
  }

  let updateError = false;
  try {
    await prisma.actualite.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content: normalizedContent,
        featuredImage: featuredImage || null,
        category,
        status,
        location,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        publishedAt,
      },
    });
  } catch {
    updateError = true;
  }

  if (updateError) {
    return redirect("/admin/actualites?error=update");
  }

  await logAdminActivity({
    action: "update",
    entityType: "actualite",
    entityId: id,
    details: `Mise à jour actualité: ${title}`,
  });

  revalidatePath("/");
  revalidatePath("/actualite");
  revalidatePath(`/actualite/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/actualites");
  return redirect(`/admin/actualites?status=updated&edit=${id}`);
}

async function addActualiteGalleryImagesAction(formData: FormData) {
  "use server";

  await requireAdmin();
  if (!process.env.DATABASE_URL) {
    return redirect("/admin/actualites?error=no-database");
  }

  const actualiteId = String(formData.get("actualiteId") ?? "").trim();
  const files = formData.getAll("galleryFiles");

  if (!actualiteId || files.length === 0) {
    return redirect("/admin/actualites?error=gallery-missing");
  }

  const article = await prisma.actualite.findUnique({
    where: { id: actualiteId },
    select: { id: true, slug: true, featuredImage: true },
  });

  if (!article) {
    return redirect("/admin/actualites?error=gallery-article");
  }

  const maxSort = await prisma.actualiteGalleryImage.findFirst({
    where: { actualiteId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  let sortOrder = (maxSort?.sortOrder ?? -1) + 1;
  let firstUploadedImage = "";
  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) {
      continue;
    }

    const imagePath = await saveUploadedImage(entry, `${article.slug}-gallery-${sortOrder + 1}`);
    if (!imagePath) {
      continue;
    }

    if (!firstUploadedImage) {
      firstUploadedImage = imagePath;
    }

    await prisma.actualiteGalleryImage.create({
      data: {
        actualiteId,
        imagePath,
        sortOrder,
      },
    });
    sortOrder += 1;
  }

  if (!article.featuredImage && firstUploadedImage) {
    await prisma.actualite.update({
      where: { id: actualiteId },
      data: { featuredImage: firstUploadedImage },
    });
  }

  await logAdminActivity({
    action: "create",
    entityType: "actualite_gallery_image",
    entityId: actualiteId,
    details: `Ajout images galerie article ${actualiteId}`,
  });

  revalidatePath("/");
  revalidatePath("/actualite");
  revalidatePath(`/actualite/${article.slug}`);
  revalidatePath("/admin/actualites");
  return redirect(`/admin/actualites?status=gallery-added&edit=${actualiteId}`);
}

async function deleteActualiteGalleryImageAction(formData: FormData) {
  "use server";

  await requireAdmin();
  if (!process.env.DATABASE_URL) {
    return redirect("/admin/actualites?error=no-database");
  }

  const id = String(formData.get("id") ?? "").trim();
  const actualiteIdFromForm = String(formData.get("actualiteId") ?? "").trim();
  if (!id) {
    return redirect("/admin/actualites?error=gallery-delete");
  }

  let actualiteId = actualiteIdFromForm;
  if (!actualiteId) {
    const existing = await prisma.actualiteGalleryImage.findUnique({
      where: { id },
      select: { actualiteId: true },
    });
    actualiteId = existing?.actualiteId ?? "";
  }

  let deleteError = false;
  try {
    await prisma.actualiteGalleryImage.delete({ where: { id } });
  } catch {
    deleteError = true;
  }

  if (deleteError) {
    return redirect("/admin/actualites?error=gallery-delete");
  }

  await logAdminActivity({
    action: "delete",
    entityType: "actualite_gallery_image",
    entityId: id,
    details: "Suppression image galerie article",
  });

  revalidatePath("/admin/actualites");
  if (actualiteId) {
    return redirect(`/admin/actualites?status=gallery-deleted&edit=${actualiteId}`);
  }
  return redirect("/admin/actualites?status=gallery-deleted");
}

async function deleteActualiteAction(formData: FormData) {
  "use server";

  await requireAdmin();
  if (!process.env.DATABASE_URL) {
    return redirect("/admin/actualites?error=no-database");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return redirect("/admin/actualites?error=delete");
  }

  let deleteError = false;
  try {
    await prisma.actualite.delete({ where: { id } });
  } catch {
    deleteError = true;
  }

  if (deleteError) {
    return redirect("/admin/actualites?error=delete");
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
  return redirect("/admin/actualites?status=deleted");
}

async function getActualites(editId: string) {
  if (!process.env.DATABASE_URL) {
    return { editingItem: null, mediaRows: [], dbConfigured: false };
  }

  try {
    const [editingItem, mediaRows] = await Promise.all([
      editId
        ? prisma.actualite.findUnique({
            where: { id: editId },
            include: {
              gallery: {
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              },
            },
          })
        : Promise.resolve(null),
      prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: 120,
      }),
    ]);
    return { editingItem, mediaRows, dbConfigured: true };
  } catch {
    return { editingItem: null, mediaRows: [], dbConfigured: false };
  }
}

export default async function AdminActualitesPage({ searchParams }: ActualitesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const requestedEditId = String(params.edit ?? "").trim();
  const { editingItem, mediaRows, dbConfigured } = await getActualites(requestedEditId);
  const isEditMode = Boolean(requestedEditId && editingItem);
  const formKey = isEditMode ? `edit-${editingItem?.id}` : "create";
  const emptyStateLabel = "Base de données non configurée. Ajoutez `DATABASE_URL` pour activer la gestion des actualités.";

  return (
    <div className="space-y-6">
      {!dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          {emptyStateLabel}
        </div>
      ) : null}

      {params.status ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          Opération réalisée: {params.status}.
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Impossible de traiter la demande ({params.error}).
        </p>
      ) : null}

      {requestedEditId && !editingItem ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          L&apos;article demandé n&apos;a pas été trouvé. Ouvrez Articles &gt; Tous les articles pour sélectionner un article.
        </p>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-[#d0d7de] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8eb] bg-[#f7f9fb] px-5 py-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">Éditeur de contenu</p>
            <h2 className="text-lg font-bold text-[#111827]">{isEditMode ? "Modifier un article" : "Créer un article"}</h2>
            <p className="text-xs text-[#667085]">
              {isEditMode
                ? "Le formulaire est préchargé. Modifiez les champs puis enregistrez."
                : "Rédigez un nouvel article, ajoutez une image et publiez."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/actualites/publies" className="btn-ghost px-4 py-2 text-sm">
              Tous les articles
            </Link>
            {isEditMode ? (
              <Link href="/admin/actualites" className="btn-ghost px-4 py-2 text-sm">
                Nouvel article
              </Link>
            ) : null}
            <button type="submit" form="actualite-form" className="btn-primary px-5 py-2 text-sm">
              {isEditMode ? "Enregistrer" : "Créer l'article"}
            </button>
          </div>
        </div>

        <form
          key={formKey}
          id="actualite-form"
          action={isEditMode ? updateActualiteAction : createActualiteAction}
          className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          {isEditMode ? <input type="hidden" name="id" value={editingItem?.id ?? ""} /> : null}
          {isEditMode ? (
            <input type="hidden" name="currentFeaturedImage" value={editingItem?.featuredImage ?? ""} />
          ) : null}

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Titre</label>
              <input
                name="title"
                placeholder="Titre principal de l'article"
                defaultValue={editingItem?.title ?? ""}
                required
                className="mt-2 w-full rounded-md border border-[#d8dde3] bg-white px-4 py-3 text-2xl font-semibold text-[#1f2937] outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Chapeau</label>
              <textarea
                name="excerpt"
                placeholder="Résumé court pour la carte actualité"
                defaultValue={editingItem?.excerpt ?? ""}
                required
                rows={4}
                className="mt-2 w-full rounded-md border border-[#d8dde3] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                Corps de l&apos;article
              </label>
              <AdminBlockEditor
                key={`content-${formKey}`}
                name="content"
                defaultValue={editingItem?.content ?? ""}
                className="mt-2"
                mediaOptions={mediaRows}
              />
            </div>
          </div>

          <aside className="border-t border-[#e5e8eb] bg-[#f8fafc] p-5 xl:border-t-0 xl:border-l">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--green-deep)]">Réglages article</p>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Statut de publication</label>
                <select
                  name="status"
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  defaultValue={editingItem?.status ?? ContentStatus.PUBLISHED}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Slug</label>
                <input
                  name="slug"
                  placeholder="slug-optionnel"
                  defaultValue={editingItem?.slug ?? ""}
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Date de publication</label>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  defaultValue={editingItem ? toDatetimeLocalValue(editingItem.publishedAt) : toDatetimeLocalValue(new Date())}
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Catégorie</label>
                <select
                  name="category"
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  defaultValue={editingItem?.category ?? NewsCategory.ACTUALITE}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Lieu</label>
                <input
                  name="location"
                  placeholder="Lieu de l'actualité"
                  defaultValue={editingItem?.location ?? ""}
                  required
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              </div>
              <AdminImageUploadInput
                key={`featured-${formKey}`}
                name="featuredImageFile"
                label={isEditMode ? "Remplacer l'image mise en avant" : "Image mise en avant (import direct)"}
                defaultPreview={editingItem?.featuredImage ?? ""}
              />
              {isEditMode ? (
                <p className="rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-xs text-[#667085]">
                  La galerie de cet article se gère juste en dessous du formulaire.
                </p>
              ) : (
                <AdminMultiImageUploadInput key={`gallery-${formKey}`} name="galleryFiles" label="Galerie article (import multiple)" />
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-md border border-[#e0e5ea] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--green-deep)]">SEO</p>
              <input
                name="seoTitle"
                placeholder="SEO title"
                defaultValue={editingItem?.seoTitle ?? ""}
                className="w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
              <input
                name="seoKeywords"
                placeholder="SEO keywords"
                defaultValue={editingItem?.seoKeywords ?? ""}
                className="w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
              <textarea
                name="seoDescription"
                placeholder="SEO description"
                defaultValue={editingItem?.seoDescription ?? ""}
                rows={3}
                className="w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
            </div>
          </aside>
        </form>
      </section>

      {editingItem ? (
        <section className="overflow-hidden rounded-lg border border-[#d0d7de] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#e5e8eb] bg-[#f7f9fb] px-5 py-3">
            <h3 className="text-sm font-semibold text-[#0f6639]">Galerie de l&apos;article en cours d&apos;édition</h3>
          </div>
          <div className="space-y-4 p-5">
            <form action={addActualiteGalleryImagesAction} className="space-y-3">
              <input type="hidden" name="actualiteId" value={editingItem.id} />
              <AdminMultiImageUploadInput name="galleryFiles" label="Ajouter des images à la galerie" />
              <button type="submit" className="btn-ghost px-4 py-2 text-xs">
                Ajouter à la galerie
              </button>
            </form>

            {editingItem.gallery.length === 0 ? (
              <p className="rounded-md border border-dashed border-[#d8dde3] bg-[#fafbfc] px-4 py-3 text-xs text-[#667085]">
                Aucune image dans la galerie pour le moment.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {editingItem.gallery.map((image) => (
                  <div key={image.id} className="rounded-md border border-[#d8dde3] bg-white p-2">
                    <img src={image.imagePath} alt={image.caption || "Image galerie article"} className="h-28 w-full rounded object-cover" />
                    <p className="mt-2 text-xs text-[#667085]">
                      {image.caption || "Sans légende"} - ordre {image.sortOrder}
                    </p>
                    <AdminDeleteDialog message="Retirer cette image de la galerie ?">
                      <form action={deleteActualiteGalleryImageAction} className="mt-2">
                        <input type="hidden" name="id" value={image.id} />
                        <input type="hidden" name="actualiteId" value={editingItem.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-[rgba(214,101,0,0.35)] bg-[rgba(240,122,20,0.12)] px-3 py-1 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
                        >
                          Retirer
                        </button>
                      </form>
                    </AdminDeleteDialog>
                  </div>
                ))}
              </div>
            )}

            <AdminDeleteDialog message="Supprimer définitivement cet article et toutes ses images ?">
              <form action={deleteActualiteAction}>
                <input type="hidden" name="id" value={editingItem.id} />
                <button
                  type="submit"
                  className="rounded-md border border-[rgba(214,101,0,0.35)] bg-[rgba(240,122,20,0.12)] px-4 py-2 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
                >
                  Supprimer cet article
                </button>
              </form>
            </AdminDeleteDialog>
          </div>
        </section>
      ) : null}
    </div>
  );
}
