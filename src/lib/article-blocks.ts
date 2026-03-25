export type ArticleBlockType = "paragraph" | "heading" | "quote" | "image" | "gallery" | "divider";

export type ArticleGalleryImage = {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
};

export type ArticleParagraphBlock = {
  id: string;
  type: "paragraph";
  html: string;
};

export type ArticleHeadingBlock = {
  id: string;
  type: "heading";
  html: string;
  level: 2 | 3 | 4;
};

export type ArticleQuoteBlock = {
  id: string;
  type: "quote";
  html: string;
  cite?: string;
};

export type ArticleImageBlock = {
  id: string;
  type: "image";
  url?: string;
  alt?: string;
  caption?: string;
};

export type ArticleGalleryBlock = {
  id: string;
  type: "gallery";
  images: ArticleGalleryImage[];
};

export type ArticleDividerBlock = {
  id: string;
  type: "divider";
};

export type ArticleBlock =
  | ArticleParagraphBlock
  | ArticleHeadingBlock
  | ArticleQuoteBlock
  | ArticleImageBlock
  | ArticleGalleryBlock
  | ArticleDividerBlock;

type LegacyBlock =
  | {
      id?: string;
      type?: string;
      text?: string;
      level?: number;
      quote?: string;
      cite?: string;
      url?: string;
      alt?: string;
      caption?: string;
      items?: string;
      ordered?: boolean;
      images?: unknown;
      html?: string;
    }
  | Record<string, unknown>;

type ArticleBlockPayload = {
  version?: number;
  blocks?: unknown;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `blk-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeInlineHtml(value: string) {
  return value
    .replace(/<(script|style|iframe|object|embed|meta|link)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|blockquote|h[1-6]|ul|ol)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function plainTextToHtml(value: string) {
  const normalized = String(value ?? "").replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function normalizeRichTextHtml(value: string) {
  const source = String(value ?? "").trim();
  if (!source) {
    return "";
  }

  const sanitized = sanitizeInlineHtml(source);
  if (!stripHtml(sanitized)) {
    return "";
  }

  if (!sanitized.includes("<")) {
    return plainTextToHtml(sanitized);
  }

  return sanitized;
}

export function createArticleBlock(type: ArticleBlockType): ArticleBlock {
  const id = createId();

  if (type === "heading") {
    return { id, type, html: "", level: 2 };
  }

  if (type === "quote") {
    return { id, type, html: "", cite: "" };
  }

  if (type === "image") {
    return { id, type, url: "", alt: "", caption: "" };
  }

  if (type === "gallery") {
    return { id, type, images: [] };
  }

  if (type === "divider") {
    return { id, type };
  }

  return { id, type, html: "" };
}

export function createGalleryImage(data?: Partial<ArticleGalleryImage>): ArticleGalleryImage {
  return {
    id: data?.id || createId(),
    url: String(data?.url ?? "").trim(),
    alt: String(data?.alt ?? "").trim(),
    caption: String(data?.caption ?? "").trim(),
  };
}

function normalizeLegacyGalleryImages(value: unknown): ArticleGalleryImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const url = String(raw.url ?? raw.imagePath ?? "").trim();
      if (!url) {
        return null;
      }

      return createGalleryImage({
        id: String(raw.id ?? ""),
        url,
        alt: String(raw.alt ?? raw.altText ?? "").trim(),
        caption: String(raw.caption ?? "").trim(),
      });
    })
    .filter((item): item is ArticleGalleryImage => Boolean(item));
}

function normalizeLegacyList(items: string, ordered: boolean) {
  const values = items
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length === 0) {
    return "";
  }

  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
}

export function sanitizeArticleBlock(raw: LegacyBlock): ArticleBlock | null {
  const type = String(raw.type ?? "").trim();
  const id = String(raw.id ?? "").trim() || createId();

  if (type === "heading") {
    const level = Number(raw.level);
    return {
      id,
      type: "heading",
      html: normalizeRichTextHtml(String(raw.html ?? raw.text ?? "")),
      level: level === 3 || level === 4 ? level : 2,
    };
  }

  if (type === "quote") {
    return {
      id,
      type: "quote",
      html: normalizeRichTextHtml(String(raw.html ?? raw.quote ?? raw.text ?? "")),
      cite: String(raw.cite ?? "").trim(),
    };
  }

  if (type === "image") {
    return {
      id,
      type: "image",
      url: String(raw.url ?? "").trim(),
      alt: String(raw.alt ?? "").trim(),
      caption: String(raw.caption ?? "").trim(),
    };
  }

  if (type === "gallery") {
    return {
      id,
      type: "gallery",
      images: normalizeLegacyGalleryImages(raw.images),
    };
  }

  if (type === "divider") {
    return { id, type: "divider" };
  }

  if (type === "list") {
    return {
      id,
      type: "paragraph",
      html: normalizeLegacyList(String(raw.items ?? ""), Boolean(raw.ordered)),
    };
  }

  if (!type || type === "paragraph") {
    return {
      id,
      type: "paragraph",
      html: normalizeRichTextHtml(String(raw.html ?? raw.text ?? "")),
    };
  }

  return null;
}

export function parseArticleBlocks(value?: string | null): ArticleBlock[] {
  const source = String(value ?? "").trim();
  if (!source) {
    return [];
  }

  try {
    const parsed = JSON.parse(source) as ArticleBlockPayload | LegacyBlock[];
    const rawBlocks = Array.isArray(parsed) ? parsed : parsed?.blocks;
    if (!Array.isArray(rawBlocks)) {
      return [];
    }

    return rawBlocks
      .map((raw) => (raw && typeof raw === "object" ? sanitizeArticleBlock(raw as LegacyBlock) : null))
      .filter((item): item is ArticleBlock => Boolean(item));
  } catch {
    return [
      {
        id: createId(),
        type: "paragraph",
        html: plainTextToHtml(source),
      },
    ];
  }
}

export function serializeArticleBlocks(blocks: ArticleBlock[]) {
  const payload = {
    version: 2,
    blocks: blocks.map((block) => sanitizeArticleBlock(block)).filter((item): item is ArticleBlock => Boolean(item)),
  };

  return JSON.stringify(payload);
}

export function isMeaningfulArticleBlock(block: ArticleBlock) {
  if (block.type === "divider") {
    return true;
  }

  if (block.type === "image") {
    return Boolean(String(block.url ?? "").trim());
  }

  if (block.type === "gallery") {
    return block.images.some((image) => Boolean(String(image.url ?? "").trim()));
  }

  return Boolean(stripHtml(block.html));
}

export function compactArticleBlocks(blocks: ArticleBlock[]) {
  return blocks.filter(isMeaningfulArticleBlock);
}

export function getArticleBlockImageInputName(blockId: string) {
  return `articleBlockImageFile__${blockId}`;
}

export function getArticleBlockGalleryInputName(blockId: string) {
  return `articleBlockGalleryFiles__${blockId}`;
}
