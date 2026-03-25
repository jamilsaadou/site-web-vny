"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { MediaPickerItem } from "@/components/admin-media-picker";
import {
  type ArticleBlock,
  type ArticleBlockType,
  type ArticleGalleryBlock,
  type ArticleGalleryImage,
  type ArticleHeadingBlock,
  type ArticleImageBlock,
  type ArticleParagraphBlock,
  type ArticleQuoteBlock,
  createArticleBlock,
  createGalleryImage,
  getArticleBlockGalleryInputName,
  getArticleBlockImageInputName,
  normalizeRichTextHtml,
  parseArticleBlocks,
  serializeArticleBlocks,
  stripHtml,
} from "@/lib/article-blocks";
import { cn } from "@/lib/utils";

// ==================== TYPES ====================

type AdminBlockEditorProps = {
  name: string;
  defaultValue?: string | null;
  className?: string;
  mediaOptions?: MediaPickerItem[];
};

type PendingFilePreview = {
  id: string;
  name: string;
  objectUrl: string;
};

// ==================== ICONS ====================

function IconBold({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function IconItalic({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function IconUnderline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

function IconStrikethrough({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4H9a3 3 0 0 0-2.83 4" />
      <path d="M14 12a4 4 0 0 1 0 8H6" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

function IconListBullet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconListNumber({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconEraser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconParagraph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4v16" />
      <path d="M17 4v16" />
      <path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13" />
    </svg>
  );
}

function IconHeading({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12h12" />
      <path d="M6 4v16" />
      <path d="M18 4v16" />
    </svg>
  );
}

function IconQuote({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

function IconImage({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconGallery({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconDivider({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <polyline points="8 8 3 12 8 16" />
      <polyline points="16 8 21 12 16 16" />
    </svg>
  );
}

function IconChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconGripVertical({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="5" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="19" r="1" fill="currentColor" />
      <circle cx="15" cy="5" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ==================== BLOCK CONFIG ====================

const blockConfig: Record<ArticleBlockType, { icon: typeof IconParagraph; label: string; description: string }> = {
  paragraph: {
    icon: IconParagraph,
    label: "Paragraphe",
    description: "Texte avec mise en forme, listes et liens",
  },
  heading: {
    icon: IconHeading,
    label: "Titre",
    description: "Titre de section H2, H3 ou H4",
  },
  quote: {
    icon: IconQuote,
    label: "Citation",
    description: "Citation mise en avant avec source",
  },
  image: {
    icon: IconImage,
    label: "Image",
    description: "Image unique avec légende",
  },
  gallery: {
    icon: IconGallery,
    label: "Galerie",
    description: "Grille d'images multiples",
  },
  divider: {
    icon: IconDivider,
    label: "Séparateur",
    description: "Ligne horizontale de séparation",
  },
};

// ==================== HELPERS ====================

function createPreviewId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `preview-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function createPendingFilePreviews(files: File[]) {
  return files.map((file) => ({
    id: createPreviewId(),
    name: file.name,
    objectUrl: URL.createObjectURL(file),
  }));
}

function revokePendingFilePreviews(entries: PendingFilePreview[]) {
  entries.forEach((entry) => URL.revokeObjectURL(entry.objectUrl));
}

// ==================== TOOLBAR BUTTON ====================

function ToolbarIconButton({
  icon: Icon,
  title,
  onClick,
  active = false,
  className,
}: {
  icon: typeof IconBold;
  title: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-[#0f6639] text-white"
          : "text-[#475467] hover:bg-[#f0f3f5] hover:text-[#1f2937]",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

// ==================== BLOCK INSERTER ====================

function BlockInserter({
  onInsert,
  position = "center",
}: {
  onInsert: (type: ArticleBlockType) => void;
  position?: "center" | "start";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const blockTypes: ArticleBlockType[] = ["paragraph", "heading", "quote", "image", "gallery", "divider"];

  return (
    <div
      ref={menuRef}
      className={cn(
        "relative flex items-center",
        position === "center" ? "justify-center" : "justify-start",
      )}
    >
      <div
        className={cn(
          "group flex items-center gap-2 py-2",
          position === "center" && "w-full",
        )}
      >
        {position === "center" && (
          <div className="h-px flex-1 bg-[#e5e7eb] opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
            isOpen
              ? "border-[#0f6639] bg-[#0f6639] text-white"
              : "border-[#d1d5db] bg-white text-[#9ca3af] hover:border-[#0f6639] hover:bg-[#0f6639] hover:text-white",
          )}
        >
          <IconPlus className={cn("h-4 w-4 transition-transform", isOpen && "rotate-45")} />
        </button>
        {position === "center" && (
          <div className="h-px flex-1 bg-[#e5e7eb] opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-1/2 z-50 mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-xl">
          <div className="border-b border-[#f3f4f6] bg-[#f9fafb] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
              Insérer un bloc
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {blockTypes.map((type) => {
              const config = blockConfig[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onInsert(type);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#f3f4f6]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#0f6639]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{config.label}</p>
                    <p className="text-xs text-[#6b7280]">{config.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MEDIA LIBRARY ====================

function MediaLibraryModal({
  items,
  selectedPaths = [],
  onPick,
  onClose,
  multi = false,
}: {
  items: MediaPickerItem[];
  selectedPaths?: string[];
  onPick: (item: MediaPickerItem) => void;
  onClose: () => void;
  multi?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f9fafb] px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#111827]">Médiathèque</h3>
            <p className="text-sm text-[#6b7280]">
              {multi
                ? "Cliquez pour ajouter des images à la galerie"
                : "Sélectionnez une image"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827]"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconFolder className="h-12 w-12 text-[#d1d5db]" />
              <p className="mt-4 text-sm font-medium text-[#6b7280]">
                Aucune image dans la médiathèque
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => {
                const selected = selectedPaths.includes(item.filePath);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPick(item)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border-2 bg-white transition-all",
                      selected
                        ? "border-[#0f6639] ring-4 ring-[#0f6639]/20"
                        : "border-[#e5e7eb] hover:border-[#0f6639]",
                    )}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.filePath}
                        alt={item.altText || item.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    {selected && (
                      <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0f6639] text-white">
                        <IconCheck className="h-4 w-4" />
                      </div>
                    )}
                    <div className="border-t border-[#f3f4f6] p-2">
                      <p className="truncate text-xs font-medium text-[#374151]">
                        {item.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== RICH TEXT EDITOR ====================

function RichTextEditor({
  html,
  onChange,
  placeholder,
  allowLists = true,
  minHeight = 140,
}: {
  html: string;
  onChange: (nextHtml: string) => void;
  placeholder: string;
  allowLists?: boolean;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const element = editorRef.current;
    if (!element) return;

    if (element.innerHTML !== html) {
      element.innerHTML = html;
    }
  }, [html]);

  const isEmpty = stripHtml(html).length === 0;

  const syncEditorValue = useCallback(() => {
    const element = editorRef.current;
    if (!element) return;

    onChange(normalizeRichTextHtml(element.innerHTML));
  }, [onChange]);

  const runCommand = useCallback((command: string, value?: string) => {
    const element = editorRef.current;
    if (!element) return;

    element.focus();
    document.execCommand(command, false, value);
    syncEditorValue();
  }, [syncEditorValue]);

  const handleLink = useCallback(() => {
    const url = window.prompt("Entrez l'URL du lien:");
    if (url) {
      runCommand("createLink", url);
    }
  }, [runCommand]);

  return (
    <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm transition-shadow focus-within:border-[#0f6639] focus-within:ring-4 focus-within:ring-[#0f6639]/10">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#f3f4f6] bg-[#fafafa] px-3 py-2">
        <div className="flex items-center gap-0.5 rounded-lg bg-white p-1 shadow-sm">
          <ToolbarIconButton
            icon={IconBold}
            title="Gras (Ctrl+B)"
            onClick={() => runCommand("bold")}
          />
          <ToolbarIconButton
            icon={IconItalic}
            title="Italique (Ctrl+I)"
            onClick={() => runCommand("italic")}
          />
          <ToolbarIconButton
            icon={IconUnderline}
            title="Souligné (Ctrl+U)"
            onClick={() => runCommand("underline")}
          />
          <ToolbarIconButton
            icon={IconStrikethrough}
            title="Barré"
            onClick={() => runCommand("strikeThrough")}
          />
        </div>

        {allowLists && (
          <div className="flex items-center gap-0.5 rounded-lg bg-white p-1 shadow-sm">
            <ToolbarIconButton
              icon={IconListBullet}
              title="Liste à puces"
              onClick={() => runCommand("insertUnorderedList")}
            />
            <ToolbarIconButton
              icon={IconListNumber}
              title="Liste numérotée"
              onClick={() => runCommand("insertOrderedList")}
            />
          </div>
        )}

        <div className="flex items-center gap-0.5 rounded-lg bg-white p-1 shadow-sm">
          <ToolbarIconButton
            icon={IconLink}
            title="Insérer un lien"
            onClick={handleLink}
          />
          <ToolbarIconButton
            icon={IconEraser}
            title="Supprimer le formatage"
            onClick={() => runCommand("removeFormat")}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        {isEmpty && !focused && (
          <p className="pointer-events-none absolute top-4 left-4 text-sm text-[#9ca3af]">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            syncEditorValue();
          }}
          onInput={syncEditorValue}
          style={{ minHeight }}
          className={cn(
            "block w-full px-4 py-4 text-sm leading-7 text-[#1f2937] outline-none",
            "[&_a]:font-medium [&_a]:text-[#0f6639] [&_a]:underline",
            "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-l-[#f07a14] [&_blockquote]:pl-4 [&_blockquote]:italic",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6",
            "[&_li]:leading-7",
            "[&_strong]:font-bold [&_b]:font-bold",
            "[&_em]:italic [&_i]:italic",
            "[&_u]:underline",
            "[&_s]:line-through [&_strike]:line-through",
          )}
        />
      </div>
    </div>
  );
}

// ==================== IMAGE BLOCK ====================

function ImageBlockEditor({
  block,
  mediaOptions,
  onChange,
}: {
  block: ArticleImageBlock;
  mediaOptions: MediaPickerItem[];
  onChange: (patch: Partial<ArticleImageBlock>) => void;
}) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(block.url ?? "");
  const [fileInputKey, setFileInputKey] = useState(0);
  const objectUrlRef = useRef<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!objectUrlRef.current) {
      setPreviewUrl(block.url ?? "");
    }
  }, [block.url]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    [],
  );

  const resetPendingUpload = (nextPreview = block.url ?? "") => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(nextPreview);
    setFileInputKey((value) => value + 1);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="group relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#fafafa]">
          <img
            src={previewUrl}
            alt={block.alt || block.caption || "Aperçu image"}
            className="h-64 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#374151] shadow-lg transition-transform hover:scale-105"
            >
              <IconFolder className="h-4 w-4" />
              Changer
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ url: "", alt: "", caption: "" });
                resetPendingUpload("");
              }}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
            >
              <IconTrash className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
            isDragging
              ? "border-[#0f6639] bg-[#f0fdf4]"
              : "border-[#d1d5db] bg-[#fafafa]",
          )}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4] text-[#0f6639]">
            <IconImage className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-[#374151]">
            Glissez une image ici ou
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f3f4f6]"
            >
              <IconFolder className="h-4 w-4" />
              Médiathèque
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#0f6639] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0d5730]">
              <IconUpload className="h-4 w-4" />
              Importer
              <input
                key={fileInputKey}
                type="file"
                name={getArticleBlockImageInputName(block.id)}
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Hidden file input for form submission */}
      {previewUrl && (
        <input
          key={fileInputKey}
          type="file"
          name={getArticleBlockImageInputName(block.id)}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#475467]">
            Texte alternatif
          </label>
          <input
            value={block.alt ?? ""}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Description pour l'accessibilité"
            className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#0f6639] focus:ring-4 focus:ring-[#0f6639]/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#475467]">
            Légende
          </label>
          <input
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Légende sous l'image"
            className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#0f6639] focus:ring-4 focus:ring-[#0f6639]/10"
          />
        </div>
      </div>

      {showLibrary && (
        <MediaLibraryModal
          items={mediaOptions}
          selectedPaths={block.url ? [block.url] : []}
          onClose={() => setShowLibrary(false)}
          onPick={(item) => {
            onChange({
              url: item.filePath,
              alt: block.alt || item.altText || item.title,
            });
            resetPendingUpload(item.filePath);
            setShowLibrary(false);
          }}
        />
      )}
    </div>
  );
}

// ==================== GALLERY BLOCK ====================

function GalleryBlockEditor({
  block,
  mediaOptions,
  onChange,
}: {
  block: ArticleGalleryBlock;
  mediaOptions: MediaPickerItem[];
  onChange: (nextImages: ArticleGalleryImage[]) => void;
}) {
  const [showLibrary, setShowLibrary] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingFilesRef = useRef<File[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingFilePreview[]>([]);

  useEffect(
    () => () => {
      revokePendingFilePreviews(pendingEntries);
    },
    [pendingEntries],
  );

  const syncPendingEntries = (files: File[]) => {
    setPendingEntries((prev) => {
      revokePendingFilePreviews(prev);
      return createPendingFilePreviews(files);
    });
  };

  const applyFilesToInput = (files: File[]) => {
    pendingFilesRef.current = files;

    if (inputRef.current) {
      const transfer = new DataTransfer();
      files.forEach((file) => transfer.items.add(file));
      inputRef.current.files = transfer.files;
    }

    syncPendingEntries(files);
  };

  const totalImages = block.images.length + pendingEntries.length;

  return (
    <div className="space-y-4">
      {/* Gallery Preview Grid */}
      {totalImages > 0 ? (
        <div className="space-y-4">
          {/* Existing Images */}
          {block.images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#475467]">
                  Images ({block.images.length})
                </p>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Tout supprimer
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {block.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-white"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || image.caption || `Image ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onChange(moveItem(block.images, index, index - 1))}
                        disabled={index === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#374151] transition-colors hover:bg-white disabled:opacity-40"
                      >
                        <IconChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange(moveItem(block.images, index, index + 1))}
                        disabled={index === block.images.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#374151] transition-colors hover:bg-white disabled:opacity-40"
                      >
                        <IconChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange(block.images.filter((_, i) => i !== index))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-2">
                      <input
                        value={image.caption ?? ""}
                        onChange={(e) =>
                          onChange(
                            block.images.map((entry) =>
                              entry.id === image.id
                                ? { ...entry, caption: e.target.value }
                                : entry,
                            ),
                          )
                        }
                        placeholder="Légende..."
                        className="w-full rounded border border-[#e5e7eb] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#0f6639]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Uploads */}
          {pendingEntries.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#f07a14]">
                En attente d&apos;import ({pendingEntries.length})
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pendingEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="group relative overflow-hidden rounded-xl border-2 border-dashed border-[#f07a14] bg-[#fff7ed]"
                  >
                    <img
                      src={entry.objectUrl}
                      alt={entry.name}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          applyFilesToInput(
                            pendingFilesRef.current.filter((_, i) => i !== index),
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs text-[#9a3412]">{entry.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d1d5db] bg-[#fafafa] px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4] text-[#0f6639]">
            <IconGallery className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-[#374151]">
            Aucune image dans la galerie
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            Ajoutez des images depuis la médiathèque ou importez-les
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="flex items-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f3f4f6]"
        >
          <IconFolder className="h-4 w-4" />
          Médiathèque
        </button>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#0f6639] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d5730]">
          <IconUpload className="h-4 w-4" />
          Importer des images
          <input
            ref={inputRef}
            type="file"
            name={getArticleBlockGalleryInputName(block.id)}
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="hidden"
            onChange={(e) => {
              const selectedFiles = Array.from(e.currentTarget.files ?? []).filter(
                (file) => file.type.startsWith("image/"),
              );
              if (selectedFiles.length === 0) return;
              applyFilesToInput([...pendingFilesRef.current, ...selectedFiles]);
            }}
          />
        </label>
      </div>

      {showLibrary && (
        <MediaLibraryModal
          items={mediaOptions}
          selectedPaths={block.images.map((image) => image.url)}
          multi
          onClose={() => setShowLibrary(false)}
          onPick={(item) => {
            if (block.images.some((image) => image.url === item.filePath)) {
              return;
            }
            onChange([
              ...block.images,
              createGalleryImage({
                url: item.filePath,
                alt: item.altText || item.title,
                caption: item.title,
              }),
            ]);
          }}
        />
      )}
    </div>
  );
}

// ==================== BLOCK WRAPPER ====================

function BlockWrapper({
  block,
  index,
  totalBlocks,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: {
  block: ArticleBlock;
  index: number;
  totalBlocks: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const config = blockConfig[block.type];
  const Icon = config.icon;

  return (
    <div className="group relative rounded-2xl border border-[#e5e7eb] bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Block Header */}
      <div className="flex items-center justify-between border-b border-[#f3f4f6] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 cursor-grab items-center justify-center rounded-lg bg-[#f3f4f6] text-[#6b7280] transition-colors hover:bg-[#e5e7eb] active:cursor-grabbing">
            <IconGripVertical className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#0f6639]">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-[#111827]">{config.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            title="Monter"
          >
            <IconChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            title="Descendre"
          >
            <IconChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-red-50 hover:text-red-500"
            title="Supprimer"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}

// ==================== MAIN EDITOR ====================

export function AdminBlockEditor({
  name,
  defaultValue,
  className,
  mediaOptions = [],
}: AdminBlockEditorProps) {
  const [blocks, setBlocks] = useState<ArticleBlock[]>(() => {
    const parsed = parseArticleBlocks(defaultValue);
    return parsed.length > 0 ? parsed : [];
  });

  const value = useMemo(() => serializeArticleBlocks(blocks), [blocks]);

  const addBlock = (type: ArticleBlockType, atIndex?: number) => {
    setBlocks((prev) => {
      const newBlock = createArticleBlock(type);
      if (atIndex !== undefined) {
        const next = [...prev];
        next.splice(atIndex, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  };

  const updateBlock = (id: string, updater: (block: ArticleBlock) => ArticleBlock) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? updater(block) : block)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  return (
    <div className={cn("rounded-2xl border border-[#e5e7eb] bg-[#f9fafb]", className)}>
      <input type="hidden" name={name} value={value} />

      {/* Editor Header */}
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Éditeur de contenu</h3>
            <p className="text-xs text-[#6b7280]">
              {blocks.length === 0
                ? "Commencez par ajouter un bloc"
                : `${blocks.length} bloc${blocks.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-4 p-6">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d1d5db] bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[#0f6639]">
              <IconPlus className="h-8 w-8" />
            </div>
            <h4 className="text-base font-semibold text-[#111827]">
              Commencez à créer votre contenu
            </h4>
            <p className="mt-1 max-w-sm text-sm text-[#6b7280]">
              Ajoutez des paragraphes, images, galeries, citations et plus encore.
            </p>
            <div className="mt-6">
              <BlockInserter onInsert={(type) => addBlock(type)} position="center" />
            </div>
          </div>
        ) : (
          <>
            {blocks.map((block, index) => (
              <div key={block.id}>
                {/* Inserter before block */}
                <BlockInserter onInsert={(type) => addBlock(type, index)} />

                {/* Block */}
                <BlockWrapper
                  block={block}
                  index={index}
                  totalBlocks={blocks.length}
                  onMoveUp={() => setBlocks((prev) => moveItem(prev, index, index - 1))}
                  onMoveDown={() => setBlocks((prev) => moveItem(prev, index, index + 1))}
                  onRemove={() => removeBlock(block.id)}
                >
                  {block.type === "paragraph" && (
                    <RichTextEditor
                      html={(block as ArticleParagraphBlock).html}
                      onChange={(html) =>
                        updateBlock(block.id, (current) => ({
                          ...(current as ArticleParagraphBlock),
                          html,
                        }))
                      }
                      placeholder="Rédigez votre paragraphe ici. Utilisez la barre d'outils pour mettre en forme le texte, créer des listes, ajouter des liens..."
                    />
                  )}

                  {block.type === "heading" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#475467]">
                          Niveau :
                        </label>
                        <div className="flex gap-1">
                          {([2, 3, 4] as const).map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() =>
                                updateBlock(block.id, (current) => ({
                                  ...(current as ArticleHeadingBlock),
                                  level,
                                }))
                              }
                              className={cn(
                                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                                (block as ArticleHeadingBlock).level === level
                                  ? "bg-[#0f6639] text-white"
                                  : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]",
                              )}
                            >
                              H{level}
                            </button>
                          ))}
                        </div>
                      </div>
                      <RichTextEditor
                        html={(block as ArticleHeadingBlock).html}
                        onChange={(html) =>
                          updateBlock(block.id, (current) => ({
                            ...(current as ArticleHeadingBlock),
                            html,
                          }))
                        }
                        placeholder="Saisissez le titre..."
                        allowLists={false}
                        minHeight={80}
                      />
                    </div>
                  )}

                  {block.type === "quote" && (
                    <div className="space-y-4">
                      <RichTextEditor
                        html={(block as ArticleQuoteBlock).html}
                        onChange={(html) =>
                          updateBlock(block.id, (current) => ({
                            ...(current as ArticleQuoteBlock),
                            html,
                          }))
                        }
                        placeholder="Saisissez la citation..."
                        minHeight={100}
                      />
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#475467]">
                          Source / Auteur
                        </label>
                        <input
                          value={(block as ArticleQuoteBlock).cite ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, (current) => ({
                              ...(current as ArticleQuoteBlock),
                              cite: e.target.value,
                            }))
                          }
                          placeholder="Ex: Maire de Niamey"
                          className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#0f6639] focus:ring-4 focus:ring-[#0f6639]/10"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "image" && (
                    <ImageBlockEditor
                      block={block as ArticleImageBlock}
                      mediaOptions={mediaOptions}
                      onChange={(patch) =>
                        updateBlock(block.id, (current) => ({
                          ...(current as ArticleImageBlock),
                          ...patch,
                        }))
                      }
                    />
                  )}

                  {block.type === "gallery" && (
                    <GalleryBlockEditor
                      block={block as ArticleGalleryBlock}
                      mediaOptions={mediaOptions}
                      onChange={(images) =>
                        updateBlock(block.id, (current) => ({
                          ...(current as ArticleGalleryBlock),
                          images,
                        }))
                      }
                    />
                  )}

                  {block.type === "divider" && (
                    <div className="flex items-center gap-4 py-4">
                      <div className="h-px flex-1 bg-[#e5e7eb]" />
                      <span className="text-xs text-[#9ca3af]">Séparateur</span>
                      <div className="h-px flex-1 bg-[#e5e7eb]" />
                    </div>
                  )}
                </BlockWrapper>
              </div>
            ))}

            {/* Final inserter */}
            <BlockInserter onInsert={(type) => addBlock(type)} />
          </>
        )}
      </div>
    </div>
  );
}
