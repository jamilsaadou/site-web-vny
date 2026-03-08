import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { slugify } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function getFileExtension(file: File) {
  const byName = path.extname(file.name || "").toLowerCase();
  if (byName && ALLOWED_EXTENSIONS.has(byName)) {
    return byName;
  }
  return MIME_TO_EXT[file.type] ?? ".jpg";
}

export async function saveUploadedImage(file: File, baseName: string) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("file_too_large");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("invalid_file_type");
  }

  const ext = getFileExtension(file);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("invalid_file_type");
  }

  const safeBase = slugify(baseName) || "image";
  const outputFileName = `${Date.now()}-${safeBase}${ext}`;
  const relativePath = `/uploads/${outputFileName}`;
  const outputDir = path.join(process.cwd(), "public", "uploads");
  const outputPath = path.join(outputDir, outputFileName);

  await mkdir(outputDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(outputPath, Buffer.from(bytes));

  return relativePath;
}
