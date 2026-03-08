"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { MediaPickerItem } from "@/components/admin-media-picker";

type BlockType = "paragraph" | "heading" | "list" | "quote" | "image" | "divider";

type EditorBlock = {
  id: string;
  type: BlockType;
  text?: string;
  level?: 2 | 3 | 4;
  items?: string;
  ordered?: boolean;
  quote?: string;
  cite?: string;
  url?: string;
  alt?: string;
  caption?: string;
};

type BlockEditorPayload = {
  version: 1;
  blocks: EditorBlock[];
};

type AdminBlockEditorProps = {
  name: string;
  defaultValue?: string | null;
  className?: string;
  mediaOptions?: MediaPickerItem[];
};

const blockTypeLabel: Record<BlockType, string> = {
  paragraph: "Paragraphe",
  heading: "Titre",
  list: "Liste",
  quote: "Citation",
  image: "Image",
  divider: "Séparateur",
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `blk-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function createBlock(type: BlockType): EditorBlock {
  switch (type) {
    case "heading":
      return { id: createId(), type, text: "", level: 2 };
    case "list":
      return { id: createId(), type, items: "", ordered: false };
    case "quote":
      return { id: createId(), type, quote: "", cite: "" };
    case "image":
      return { id: createId(), type, url: "", alt: "", caption: "" };
    case "divider":
      return { id: createId(), type };
    default:
      return { id: createId(), type, text: "" };
  }
}

function sanitizeBlock(raw: Partial<EditorBlock>): EditorBlock | null {
  const type = String(raw.type ?? "") as BlockType;
  if (!["paragraph", "heading", "list", "quote", "image", "divider"].includes(type)) {
    return null;
  }

  if (type === "heading") {
    const level = Number(raw.level);
    return {
      id: raw.id || createId(),
      type,
      text: String(raw.text ?? ""),
      level: level === 3 || level === 4 ? level : 2,
    };
  }

  if (type === "list") {
    return {
      id: raw.id || createId(),
      type,
      items: String(raw.items ?? ""),
      ordered: Boolean(raw.ordered),
    };
  }

  if (type === "quote") {
    return {
      id: raw.id || createId(),
      type,
      quote: String(raw.quote ?? ""),
      cite: String(raw.cite ?? ""),
    };
  }

  if (type === "image") {
    return {
      id: raw.id || createId(),
      type,
      url: String(raw.url ?? ""),
      alt: String(raw.alt ?? ""),
      caption: String(raw.caption ?? ""),
    };
  }

  if (type === "divider") {
    return {
      id: raw.id || createId(),
      type,
    };
  }

  return {
    id: raw.id || createId(),
    type,
    text: String(raw.text ?? ""),
  };
}

function parseInitialBlocks(defaultValue?: string | null): EditorBlock[] {
  const source = String(defaultValue ?? "").trim();
  if (!source) {
    return [createBlock("paragraph")];
  }

  try {
    const parsed = JSON.parse(source) as BlockEditorPayload | EditorBlock[];
    const rawBlocks = Array.isArray(parsed) ? parsed : parsed?.blocks;
    if (!Array.isArray(rawBlocks)) {
      return [createBlock("paragraph")];
    }

    const blocks = rawBlocks
      .map((raw) => sanitizeBlock(raw))
      .filter((item): item is EditorBlock => Boolean(item));

    if (blocks.length > 0) {
      return blocks;
    }
  } catch {
    return [
      {
        id: createId(),
        type: "paragraph",
        text: source,
      },
    ];
  }

  return [createBlock("paragraph")];
}

function serializeBlocks(blocks: EditorBlock[]) {
  const payload: BlockEditorPayload = {
    version: 1,
    blocks,
  };
  return JSON.stringify(payload);
}

function moveBlock(blocks: EditorBlock[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= blocks.length) {
    return blocks;
  }

  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function AdminBlockEditor({ name, defaultValue, className, mediaOptions = [] }: AdminBlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseInitialBlocks(defaultValue));
  const value = useMemo(() => serializeBlocks(blocks), [blocks]);

  const onAddBlock = (type: BlockType) => {
    setBlocks((prev) => [...prev, createBlock(type)]);
  };

  const onRemoveBlock = (id: string) => {
    setBlocks((prev) => {
      const filtered = prev.filter((block) => block.id !== id);
      return filtered.length > 0 ? filtered : [createBlock("paragraph")];
    });
  };

  const onUpdateBlock = (id: string, patch: Partial<EditorBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== id) {
          return block;
        }
        return { ...block, ...patch };
      }),
    );
  };

  return (
    <div className={cn("rounded-lg border border-[#d8dde3] bg-[#fdfefe]", className)}>
      <input type="hidden" name={name} value={value} />

      <div className="flex flex-wrap items-center gap-2 border-b border-[#e4e8ec] bg-[#f6f7f8] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5b6670]">Blocs:</span>
        {(["paragraph", "heading", "list", "quote", "image", "divider"] as BlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onAddBlock(type)}
            className="rounded border border-[#c9d0d7] bg-white px-2 py-1 text-[11px] font-semibold text-[#1f2933] hover:bg-[#f0f3f5]"
          >
            + {blockTypeLabel[type]}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-3">
        {blocks.map((block, index) => (
          <div key={block.id} className="rounded-lg border border-[#d8dde3] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eceff2] px-3 py-2">
              <p className="text-xs font-semibold text-[#33404a]">
                Bloc {index + 1} - {blockTypeLabel[block.type]}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBlocks((prev) => moveBlock(prev, index, index - 1))}
                  className="rounded border border-[#d4dbe1] bg-white px-2 py-1 text-[11px] text-[#33404a] hover:bg-[#f7f9fa]"
                >
                  Haut
                </button>
                <button
                  type="button"
                  onClick={() => setBlocks((prev) => moveBlock(prev, index, index + 1))}
                  className="rounded border border-[#d4dbe1] bg-white px-2 py-1 text-[11px] text-[#33404a] hover:bg-[#f7f9fa]"
                >
                  Bas
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveBlock(block.id)}
                  className="rounded border border-[rgba(214,101,0,0.28)] bg-[rgba(240,122,20,0.12)] px-2 py-1 text-[11px] font-semibold text-[var(--orange-strong)] hover:bg-[rgba(240,122,20,0.2)]"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="space-y-3 px-3 py-3">
              {block.type === "paragraph" ? (
                <textarea
                  value={block.text ?? ""}
                  onChange={(event) => onUpdateBlock(block.id, { text: event.target.value })}
                  rows={4}
                  placeholder="Texte du paragraphe"
                  className="w-full rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                />
              ) : null}

              {block.type === "heading" ? (
                <div className="grid gap-2 md:grid-cols-[110px_1fr]">
                  <select
                    value={block.level ?? 2}
                    onChange={(event) =>
                      onUpdateBlock(block.id, { level: Number(event.target.value) as 2 | 3 | 4 })
                    }
                    className="rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  >
                    <option value={2}>Titre H2</option>
                    <option value={3}>Titre H3</option>
                    <option value={4}>Titre H4</option>
                  </select>
                  <input
                    value={block.text ?? ""}
                    onChange={(event) => onUpdateBlock(block.id, { text: event.target.value })}
                    placeholder="Texte du titre"
                    className="rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                </div>
              ) : null}

              {block.type === "list" ? (
                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#4f5d6b]">
                    <input
                      type="checkbox"
                      checked={Boolean(block.ordered)}
                      onChange={(event) => onUpdateBlock(block.id, { ordered: event.target.checked })}
                    />
                    Liste numérotée
                  </label>
                  <textarea
                    value={block.items ?? ""}
                    onChange={(event) => onUpdateBlock(block.id, { items: event.target.value })}
                    rows={4}
                    placeholder="Un élément par ligne"
                    className="w-full rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                </div>
              ) : null}

              {block.type === "quote" ? (
                <div className="space-y-2">
                  <textarea
                    value={block.quote ?? ""}
                    onChange={(event) => onUpdateBlock(block.id, { quote: event.target.value })}
                    rows={3}
                    placeholder="Texte de la citation"
                    className="w-full rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                  <input
                    value={block.cite ?? ""}
                    onChange={(event) => onUpdateBlock(block.id, { cite: event.target.value })}
                    placeholder="Auteur / source"
                    className="w-full rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                </div>
              ) : null}

              {block.type === "image" ? (
                <div className="space-y-2">
                  <div className="grid max-h-40 grid-cols-3 gap-2 overflow-auto rounded border border-[#d8dde3] bg-[#f8fafc] p-2">
                    {mediaOptions.map((media) => (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => onUpdateBlock(block.id, { url: media.filePath, alt: media.altText || media.title })}
                        className={cn(
                          "overflow-hidden rounded border",
                          block.url === media.filePath
                            ? "border-[#2271b1] ring-2 ring-[rgba(34,113,177,0.2)]"
                            : "border-[#d8dde3]",
                        )}
                      >
                        <img
                          src={media.filePath}
                          alt={media.altText || media.title}
                          className="h-14 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  {mediaOptions.length === 0 ? (
                    <p className="text-xs text-[#6b7783]">
                      Aucune image en médiathèque. Importez d&apos;abord des images dans la section Médias.
                    </p>
                  ) : null}
                  <input
                    value={block.alt ?? ""}
                    onChange={(event) => onUpdateBlock(block.id, { alt: event.target.value })}
                    placeholder="Texte alternatif (alt)"
                    className="w-full rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                  <input
                    value={block.caption ?? ""}
                    onChange={(event) => onUpdateBlock(block.id, { caption: event.target.value })}
                    placeholder="Légende"
                    className="w-full rounded border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
                  />
                </div>
              ) : null}

              {block.type === "divider" ? (
                <p className="rounded border border-dashed border-[#cbd4dc] bg-[#f7f9fb] px-3 py-4 text-center text-xs uppercase tracking-[0.08em] text-[#6b7783]">
                  Séparateur horizontal
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
