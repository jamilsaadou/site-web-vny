"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type FileEntry = {
  file: File;
  objectUrl: string;
};

type AdminMultiImageUploadInputProps = {
  name: string;
  label?: string;
  className?: string;
};

export function AdminMultiImageUploadInput({
  name,
  label = "Importer des images",
  className,
}: AdminMultiImageUploadInputProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function syncInputFiles(files: File[]) {
    if (!inputRef.current) {
      return;
    }

    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    inputRef.current.files = transfer.files;
  }

  useEffect(
    () => () => {
      entries.forEach((e) => URL.revokeObjectURL(e.objectUrl));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function handleFiles(files: File[]) {
    const newEntries: FileEntry[] = files
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, objectUrl: URL.createObjectURL(file) }));
    setEntries((prev) => {
      const next = [...prev, ...newEntries];
      syncInputFiles(next.map((entry) => entry.file));
      return next;
    });
  }

  function removeEntry(index: number) {
    setEntries((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl);
      const next = prev.filter((_, i) => i !== index);
      syncInputFiles(next.map((entry) => entry.file));
      return next;
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    handleFiles(files);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-xs font-semibold text-[var(--muted)]">{label}</label>

      {/* Drop zone / file picker trigger */}
      <div
        role="button"
        tabIndex={0}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c8d2da] bg-[#f8fafc] py-6 text-center transition hover:border-[rgba(19,136,74,0.5)] hover:bg-[rgba(19,136,74,0.04)]"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#b0bec8]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M3 15l5-5 4 4 3-3 6 5" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-[#475467]">Cliquer ou déposer des images ici</p>
          <p className="text-xs text-[#98a2b3]">JPG, PNG, WebP, AVIF — plusieurs fichiers acceptés, jusqu&apos;à 8 Mo par image</p>
        </div>
        {/* Hidden file input — name submitted for each selected file */}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          className="sr-only"
          onChange={handleChange}
        />
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {entries.map((entry, i) => (
            <div key={entry.objectUrl} className="group relative overflow-hidden rounded-lg border border-[#d8dde3]">
              <img src={entry.objectUrl} alt={`Image ${i + 1}`} className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                title="Retirer cette image"
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2l8 8M10 2L2 10" />
                </svg>
              </button>
              <p className="truncate bg-white px-1.5 py-1 text-[10px] text-[#667085]">{entry.file.name}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
