import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { AdminImageUploadInput } from "@/components/admin-image-upload-input";
import { AdminMediaPicker } from "@/components/admin-media-picker";
import { AdminMultiImageUploadInput } from "@/components/admin-multi-image-upload-input";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload-image";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type EvenementsPageProps = {
  searchParams: Promise<{ status?: string; error?: string; edit?: string }>;
};

const statusOptions = [
  { value: ContentStatus.PUBLISHED, label: "Publié — visible sur le site" },
  { value: ContentStatus.DRAFT, label: "Brouillon — non visible" },
];

function toDatetimeLocalValue(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function parseDateTime(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const parsed = new Date(raw);
  if (!raw || Number.isNaN(parsed.getTime())) {
    throw new Error("invalid_date");
  }
  return parsed;
}

function parseOptionalFloat(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error("invalid_number");
  return parsed;
}

function parseContentStatus(value: FormDataEntryValue | null): ContentStatus {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === ContentStatus.DRAFT) return ContentStatus.DRAFT;
  return ContentStatus.PUBLISHED;
}

async function createEventAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const featuredImageFromPicker = String(formData.get("featuredImage") ?? "").trim();
  const featuredImageFile = formData.get("featuredImageFile");
  const galleryFiles = formData.getAll("galleryFiles");
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const seoKeywords = String(formData.get("seoKeywords") ?? "").trim();
  const status = parseContentStatus(formData.get("status"));

  if (!title || !location || !detail) {
    redirect("/admin/evenements?error=missing");
  }

  const slug = slugify(slugInput || title);
  if (!slug) {
    redirect("/admin/evenements?error=slug");
  }

  let featuredImage = featuredImageFromPicker;
  if (featuredImageFile instanceof File && featuredImageFile.size > 0) {
    try {
      featuredImage = (await saveUploadedImage(featuredImageFile, `${slug}-event`)) ?? featuredImageFromPicker;
    } catch {
      redirect("/admin/evenements?error=image");
    }
  }

  let startAt: Date;
  let latitude: number | null;
  let longitude: number | null;
  try {
    startAt = parseDateTime(formData.get("startAt"));
    latitude = parseOptionalFloat(formData.get("latitude"));
    longitude = parseOptionalFloat(formData.get("longitude"));
  } catch {
    redirect("/admin/evenements?error=format");
  }

  let eventId = "";
  try {
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        location,
        detail,
        featuredImage: featuredImage || null,
        latitude,
        longitude,
        status,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        startAt,
      },
    });
    eventId = event.id;

    // Save gallery images uploaded during creation
    let sortOrder = 0;
    for (const fileEntry of galleryFiles) {
      if (!(fileEntry instanceof File) || fileEntry.size === 0) continue;
      const galleryPath = await saveUploadedImage(fileEntry, `${slug}-gallery-${sortOrder + 1}`);
      if (!galleryPath) continue;
      await prisma.eventGalleryImage.create({
        data: { eventId: event.id, imagePath: galleryPath, sortOrder },
      });
      sortOrder += 1;
    }
  } catch {
    redirect("/admin/evenements?error=create");
  }

  await logAdminActivity({
    action: "create",
    entityType: "event",
    entityId: eventId,
    details: `Création événement: ${title}`,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/evenements");
  redirect("/admin/evenements?status=created");
}

async function updateEventAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const featuredImageFromPicker = String(formData.get("featuredImage") ?? "").trim();
  const featuredImageFile = formData.get("featuredImageFile");
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const seoKeywords = String(formData.get("seoKeywords") ?? "").trim();
  const status = parseContentStatus(formData.get("status"));

  if (!id || !title || !location || !detail) {
    redirect("/admin/evenements?error=missing");
  }

  const slug = slugify(slugInput || title);
  if (!slug) {
    redirect("/admin/evenements?error=slug");
  }

  let featuredImage = featuredImageFromPicker;
  if (featuredImageFile instanceof File && featuredImageFile.size > 0) {
    try {
      featuredImage = (await saveUploadedImage(featuredImageFile, `${slug}-event`)) ?? featuredImageFromPicker;
    } catch {
      redirect("/admin/evenements?error=image");
    }
  }

  let startAt: Date;
  let latitude: number | null;
  let longitude: number | null;
  try {
    startAt = parseDateTime(formData.get("startAt"));
    latitude = parseOptionalFloat(formData.get("latitude"));
    longitude = parseOptionalFloat(formData.get("longitude"));
  } catch {
    redirect("/admin/evenements?error=format");
  }

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title, slug, location, detail,
        featuredImage: featuredImage || null,
        latitude, longitude, status,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        startAt,
      },
    });
  } catch {
    redirect("/admin/evenements?error=update");
  }

  await logAdminActivity({
    action: "update",
    entityType: "event",
    entityId: id,
    details: `Mise à jour événement: ${title}`,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/evenements");
  redirect(`/admin/evenements?status=updated&edit=${id}`);
}

async function deleteEventAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/evenements?error=delete");

  try {
    await prisma.event.delete({ where: { id } });
  } catch {
    redirect("/admin/evenements?error=delete");
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
  redirect("/admin/evenements?status=deleted");
}

async function addGalleryImageAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const eventId = String(formData.get("eventId") ?? "").trim();
  const imagePathFromPicker = String(formData.get("galleryImage") ?? "").trim();
  const galleryImageFile = formData.get("galleryImageFile");
  const caption = String(formData.get("caption") ?? "").trim();
  const sortOrder = Number(String(formData.get("sortOrder") ?? "0"));

  let imagePath = imagePathFromPicker;
  if (galleryImageFile instanceof File && galleryImageFile.size > 0) {
    try {
      imagePath = (await saveUploadedImage(galleryImageFile, `${eventId}-gallery`)) ?? imagePathFromPicker;
    } catch {
      redirect("/admin/evenements?error=gallery-image");
    }
  }

  if (!eventId || !imagePath) {
    redirect("/admin/evenements?error=gallery-missing");
  }

  const image = await prisma.eventGalleryImage.create({
    data: {
      eventId,
      imagePath,
      caption: caption || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  await logAdminActivity({
    action: "create",
    entityType: "event_gallery_image",
    entityId: image.id,
    details: `Ajout image galerie événement ${eventId}`,
  });

  revalidatePath("/admin/evenements");
  redirect(`/admin/evenements?status=gallery-added&edit=${eventId}`);
}

async function deleteGalleryImageAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  const eventIdFromForm = String(formData.get("eventId") ?? "").trim();
  if (!id) redirect("/admin/evenements?error=gallery-delete");

  let eventId = eventIdFromForm;
  if (!eventId) {
    const existing = await prisma.eventGalleryImage.findUnique({
      where: { id },
      select: { eventId: true },
    });
    eventId = existing?.eventId ?? "";
  }

  await prisma.eventGalleryImage.delete({ where: { id } });
  await logAdminActivity({
    action: "delete",
    entityType: "event_gallery_image",
    entityId: id,
    details: "Suppression image galerie événement",
  });

  revalidatePath("/admin/evenements");
  if (eventId) redirect(`/admin/evenements?status=gallery-deleted&edit=${eventId}`);
  redirect("/admin/evenements?status=gallery-deleted");
}

async function getEvents(editId: string) {
  if (!process.env.DATABASE_URL) {
    return { editingEvent: null, mediaRows: [], dbConfigured: false };
  }
  try {
    const [editingEvent, mediaRows] = await Promise.all([
      editId
        ? prisma.event.findUnique({
            where: { id: editId },
            include: {
              gallery: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
            },
          })
        : Promise.resolve(null),
      prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 120 }),
    ]);
    return { editingEvent, mediaRows, dbConfigured: true };
  } catch {
    return { editingEvent: null, mediaRows: [], dbConfigured: false };
  }
}

export default async function AdminEvenementsPage({ searchParams }: EvenementsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const requestedEditId = String(params.edit ?? "").trim();
  const { editingEvent, mediaRows, dbConfigured } = await getEvents(requestedEditId);
  const isEditMode = Boolean(requestedEditId && editingEvent);
  const formKey = isEditMode ? `edit-${editingEvent?.id}` : "create";

  return (
    <div className="space-y-6">
      {!dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez <code className="font-mono">DATABASE_URL</code> pour activer la gestion des événements.
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

      {requestedEditId && !editingEvent ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          L&apos;événement demandé n&apos;a pas été trouvé. Ouvrez Événements &gt; Tous les événements pour sélectionner un événement.
        </p>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-[#d0d7de] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8eb] bg-[#f7f9fb] px-5 py-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">Éditeur événement</p>
            <h2 className="text-lg font-bold text-[#111827]">{isEditMode ? "Modifier un événement" : "Créer un événement"}</h2>
            <p className="text-xs text-[#667085]">
              {isEditMode
                ? "Le formulaire est préchargé. Modifiez les champs puis enregistrez."
                : "Ajoutez un nouvel événement avec image, galerie, SEO et géolocalisation."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/evenements/publies" className="btn-ghost px-4 py-2 text-sm">
              Tous les événements
            </Link>
            {isEditMode ? (
              <Link href="/admin/evenements" className="btn-ghost px-4 py-2 text-sm">
                Nouvel événement
              </Link>
            ) : null}
            <button type="submit" form="event-form" className="btn-primary px-5 py-2 text-sm">
              {isEditMode ? "Enregistrer" : "Créer l'événement"}
            </button>
          </div>
        </div>

        <form
          key={formKey}
          id="event-form"
          action={isEditMode ? updateEventAction : createEventAction}
          className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          {isEditMode ? <input type="hidden" name="id" value={editingEvent?.id ?? ""} /> : null}

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Titre</label>
              <input
                name="title"
                placeholder="Titre de l'événement"
                defaultValue={editingEvent?.title ?? ""}
                required
                className="mt-2 w-full rounded-md border border-[#d8dde3] bg-white px-4 py-3 text-2xl font-semibold text-[var(--green-deep)] outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Description</label>
              <textarea
                name="detail"
                placeholder="Description de l'événement"
                defaultValue={editingEvent?.detail ?? ""}
                required
                rows={12}
                className="mt-2 w-full rounded-md border border-[#d8dde3] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
            </div>
          </div>

          <aside className="border-t border-[#e5e8eb] bg-[#f8fafc] p-5 xl:border-t-0 xl:border-l">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--green-deep)]">Réglages événement</p>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Statut de publication</label>
                <select
                  name="status"
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  defaultValue={editingEvent?.status ?? ContentStatus.PUBLISHED}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Slug</label>
                <input
                  name="slug"
                  placeholder="slug-optionnel"
                  defaultValue={editingEvent?.slug ?? ""}
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Date et heure</label>
                <input
                  type="datetime-local"
                  name="startAt"
                  defaultValue={editingEvent ? toDatetimeLocalValue(editingEvent.startAt) : toDatetimeLocalValue(new Date())}
                  required
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Lieu</label>
                <input
                  name="location"
                  placeholder="Lieu de l'événement"
                  defaultValue={editingEvent?.location ?? ""}
                  required
                  className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="latitude"
                    placeholder="13.5137"
                    defaultValue={editingEvent?.latitude ?? ""}
                    className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="longitude"
                    placeholder="2.1098"
                    defaultValue={editingEvent?.longitude ?? ""}
                    className="mt-1 w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                </div>
              </div>
              <AdminMediaPicker
                key={`featured-picker-${formKey}`}
                name="featuredImage"
                items={mediaRows}
                defaultValue={editingEvent?.featuredImage ?? ""}
                label="Image mise en avant (galerie)"
              />
              <AdminImageUploadInput
                key={`featured-upload-${formKey}`}
                name="featuredImageFile"
                label="Ou importer une nouvelle image"
                defaultPreview={editingEvent?.featuredImage ?? ""}
              />
              {!isEditMode ? (
                <AdminMultiImageUploadInput
                  key={`gallery-${formKey}`}
                  name="galleryFiles"
                  label="Galerie (images supplémentaires)"
                />
              ) : (
                <p className="rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-xs text-[#667085]">
                  La galerie se gère dans la section ci-dessous.
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-md border border-[#e0e5ea] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--green-deep)]">SEO</p>
              <input
                name="seoTitle"
                placeholder="SEO title"
                defaultValue={editingEvent?.seoTitle ?? ""}
                className="w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
              <input
                name="seoKeywords"
                placeholder="SEO keywords"
                defaultValue={editingEvent?.seoKeywords ?? ""}
                className="w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
              <textarea
                name="seoDescription"
                placeholder="SEO description"
                defaultValue={editingEvent?.seoDescription ?? ""}
                rows={3}
                className="w-full rounded-md border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
            </div>
          </aside>
        </form>
      </section>

      {editingEvent ? (
        <section className="overflow-hidden rounded-lg border border-[#d0d7de] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#e5e8eb] bg-[#f7f9fb] px-5 py-3">
            <h3 className="text-sm font-semibold text-[#0f6639]">Galerie de l&apos;événement en cours d&apos;édition</h3>
          </div>
          <div className="space-y-4 p-5">
            <form action={addGalleryImageAction} className="space-y-3">
              <input type="hidden" name="eventId" value={editingEvent.id} />
              <div className="grid gap-3 xl:grid-cols-2">
                <AdminMediaPicker name="galleryImage" items={mediaRows} label="Choisir dans la médiathèque" />
                <AdminImageUploadInput name="galleryImageFile" label="Ou importer une image galerie" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="caption"
                  placeholder="Légende (optionnel)"
                  className="rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={editingEvent.gallery.length}
                  className="rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              </div>
              <button type="submit" className="btn-ghost w-fit px-4 py-2 text-xs">
                Ajouter image galerie
              </button>
            </form>

            {editingEvent.gallery.length === 0 ? (
              <p className="rounded-md border border-dashed border-[#d8dde3] bg-[#fafbfc] px-4 py-3 text-xs text-[#667085]">
                Aucune image dans la galerie pour le moment.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {editingEvent.gallery.map((image) => (
                  <div key={image.id} className="rounded-md border border-[#d8dde3] bg-white p-2">
                    <img src={image.imagePath} alt={image.caption || "Image galerie"} className="h-28 w-full rounded object-cover" />
                    <p className="mt-1 truncate text-xs text-[#667085]">
                      {image.caption || "Sans légende"}
                    </p>
                    <AdminDeleteDialog message="Retirer cette image de la galerie ?">
                      <form action={deleteGalleryImageAction} className="mt-2">
                        <input type="hidden" name="id" value={image.id} />
                        <input type="hidden" name="eventId" value={editingEvent.id} />
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

            <AdminDeleteDialog message="Supprimer définitivement cet événement et toutes ses images ?">
              <form action={deleteEventAction}>
                <input type="hidden" name="id" value={editingEvent.id} />
                <button
                  type="submit"
                  className="rounded-md border border-[rgba(214,101,0,0.35)] bg-[rgba(240,122,20,0.12)] px-4 py-2 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
                >
                  Supprimer cet événement
                </button>
              </form>
            </AdminDeleteDialog>
          </div>
        </section>
      ) : null}
    </div>
  );
}
