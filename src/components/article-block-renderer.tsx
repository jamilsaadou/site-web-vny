import Image from "next/image";

type BlockType = "paragraph" | "heading" | "list" | "quote" | "image" | "divider";

type ContentBlock = {
  id?: string;
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

type ContentPayload = {
  version?: number;
  blocks?: ContentBlock[];
};

function parseContent(content?: string | null): ContentBlock[] {
  const source = String(content ?? "").trim();
  if (!source) {
    return [];
  }

  try {
    const parsed = JSON.parse(source) as ContentPayload | ContentBlock[];
    const blocks = Array.isArray(parsed) ? parsed : parsed.blocks;
    if (!Array.isArray(blocks)) {
      return [];
    }
    return blocks;
  } catch {
    return [
      {
        type: "paragraph",
        text: source,
      },
    ];
  }
}

export function ArticleBlockRenderer({ content }: { content?: string | null }) {
  const blocks = parseContent(content);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const level = block.level ?? 2;
          if (level === 3) {
            return (
              <h3 key={block.id || index} className="text-2xl font-extrabold text-[var(--green-deep)]">
                {block.text}
              </h3>
            );
          }
          if (level === 4) {
            return (
              <h4 key={block.id || index} className="text-xl font-bold text-[var(--green-deep)]">
                {block.text}
              </h4>
            );
          }
          return (
            <h2 key={block.id || index} className="text-3xl font-extrabold text-[var(--green-deep)]">
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          const items = String(block.items ?? "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
          if (items.length === 0) {
            return null;
          }

          if (block.ordered) {
            return (
              <ol key={block.id || index} className="list-decimal space-y-2 pl-6 text-sm leading-8 text-[var(--text)]">
                {items.map((item, itemIndex) => (
                  <li key={`${block.id || index}-${itemIndex}`}>{item}</li>
                ))}
              </ol>
            );
          }

          return (
            <ul key={block.id || index} className="list-disc space-y-2 pl-6 text-sm leading-8 text-[var(--text)]">
              {items.map((item, itemIndex) => (
                <li key={`${block.id || index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={block.id || index}
              className="rounded-lg border-l-4 border-l-[var(--orange-strong)] bg-[rgba(240,122,20,0.08)] px-5 py-4"
            >
              <p className="text-sm leading-8 text-[var(--text)]">{block.quote}</p>
              {block.cite ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  {block.cite}
                </p>
              ) : null}
            </blockquote>
          );
        }

        if (block.type === "image" && block.url) {
          return (
            <figure key={block.id || index} className="space-y-2">
              <div className="overflow-hidden rounded-xl border border-[var(--line)]">
                <Image
                  src={block.url}
                  alt={block.alt || block.caption || "Image article"}
                  width={1400}
                  height={900}
                  className="h-auto w-full object-cover"
                />
              </div>
              {block.caption ? <figcaption className="text-xs text-[var(--muted)]">{block.caption}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === "divider") {
          return <hr key={block.id || index} className="border-[var(--line)]" />;
        }

        return (
          <p key={block.id || index} className="text-sm leading-8 text-[var(--text)]">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
