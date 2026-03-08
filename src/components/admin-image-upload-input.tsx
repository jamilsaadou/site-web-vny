"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AdminImageUploadInputProps = {
  name: string;
  defaultPreview?: string | null;
  label?: string;
  className?: string;
  required?: boolean;
};

export function AdminImageUploadInput({
  name,
  defaultPreview,
  label = "Importer une image",
  className,
  required = false,
}: AdminImageUploadInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultPreview ?? "");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [objectUrl],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-semibold text-[var(--muted)]">{label}</label>
      <input
        type="file"
        name={name}
        accept="image/*"
        required={required}
        className="w-full rounded-lg border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) {
            setPreviewUrl(defaultPreview ?? "");
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
              setObjectUrl(null);
            }
            return;
          }

          const url = URL.createObjectURL(file);
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          setObjectUrl(url);
          setPreviewUrl(url);
        }}
      />
      {previewUrl ? (
        <div className="overflow-hidden rounded-lg border border-[#d8dde3] bg-[#f8fafc] p-2">
          <img src={previewUrl} alt="Aperçu image" className="h-24 w-full rounded object-cover" />
        </div>
      ) : null}
    </div>
  );
}
