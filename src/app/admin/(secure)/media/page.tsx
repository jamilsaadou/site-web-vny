import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { AdminImageUploadInput } from "@/components/admin-image-upload-input";
import { prisma } from "@/lib/prisma";
import { isUploadedAssetPath, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MediaPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function getFileExtension(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (!ext) {
    return ".jpg";
  }

  return ext;
}

async function uploadMediaAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const file = formData.get("file");

  if (!title || !(file instanceof File) || file.size === 0) {
    redirect("/admin/media?error=missing");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    redirect("/admin/media?error=size");
  }

  const ext = getFileExtension(file.name);
  const fileNameBase = slugify(path.basename(file.name, ext) || title || "media");
  const outputFileName = `${Date.now()}-${fileNameBase}${ext}`;
  const relativePath = `/uploads/${outputFileName}`;
  const outputDir = path.join(process.cwd(), "public", "uploads");
  const outputPath = path.join(outputDir, outputFileName);

  try {
    await mkdir(outputDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(outputPath, Buffer.from(bytes));
  } catch {
    redirect("/admin/media?error=write");
  }

  let mediaId = "";
  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        title,
        altText: altText || null,
        filePath: relativePath,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      },
    });
    mediaId = asset.id;
  } catch {
    redirect("/admin/media?error=db");
  }

  await logAdminActivity({
    action: "upload",
    entityType: "media_asset",
    entityId: mediaId,
    details: `Upload media ${relativePath}`,
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?status=uploaded");
}

async function deleteMediaAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/media?error=delete");
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    redirect("/admin/media?error=not-found");
  }

  await prisma.mediaAsset.delete({ where: { id } });
  if (asset.filePath.startsWith("/uploads/")) {
    const localPath = path.join(process.cwd(), "public", asset.filePath.replace(/^\/+/, ""));
    try {
      await unlink(localPath);
    } catch {
      // no-op: le fichier peut déjà avoir été retiré.
    }
  }

  await logAdminActivity({
    action: "delete",
    entityType: "media_asset",
    entityId: id,
    details: `Suppression media ${asset.filePath}`,
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?status=deleted");
}

async function getMediaAssets() {
  if (!process.env.DATABASE_URL) {
    return { rows: [], dbConfigured: false };
  }

  try {
    const rows = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { rows, dbConfigured: true };
  } catch {
    return { rows: [], dbConfigured: false };
  }
}

export default async function AdminMediaPage({ searchParams }: MediaPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const data = await getMediaAssets();

  return (
    <div className="space-y-6">
      {!data.dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez `DATABASE_URL` pour gérer les médias.
        </div>
      ) : null}

      {params.status ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          Opération réalisée: {params.status}.
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Erreur de traitement ({params.error}).
        </p>
      ) : null}

      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-xl font-extrabold text-[var(--green-deep)]">Importer une image</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Les images sont enregistrées dans `public/uploads` et réutilisables dans actualités, événements, slider et pages.
        </p>

        <form action={uploadMediaAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="title"
            placeholder="Titre média"
            required
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
          />
          <input
            name="altText"
            placeholder="Texte alternatif (SEO)"
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
          />
          <AdminImageUploadInput
            name="file"
            label="Fichier image (aperçu miniature)"
            className="md:col-span-2"
            required
          />
          <button type="submit" className="btn-primary w-fit px-5 py-2 text-sm">
            Importer l&apos;image
          </button>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.rows.map((asset) => (
          <div key={asset.id} className="soft-card overflow-hidden">
            <div className="relative h-44 bg-[rgba(19,136,74,0.06)]">
              <Image
                src={asset.filePath}
                alt={asset.altText || asset.title}
                fill
                unoptimized={isUploadedAssetPath(asset.filePath)}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-[var(--green-deep)]">{asset.title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{asset.filePath}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{asset.altText || "Alt non défini"}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{(asset.sizeBytes / 1024).toFixed(1)} KB</p>

              <form action={deleteMediaAction} className="mt-3">
                <input type="hidden" name="id" value={asset.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-[rgba(214,101,0,0.35)] bg-[rgba(240,122,20,0.12)] px-4 py-2 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
                >
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
