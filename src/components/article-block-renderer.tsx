import { parseArticleBlocks } from "@/lib/article-blocks";
import { PreviewableArticleImage } from "@/components/previewable-article-image";

const richTextClass =
  "space-y-4 text-sm leading-8 text-[var(--text)] [&_a]:font-semibold [&_a]:text-[var(--green-deep)] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-l-[var(--orange-strong)] [&_blockquote]:pl-4 [&_em]:italic [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:font-extrabold [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6";

type ArticleBlockRendererProps = {
  content?: string | null;
  mediaFit?: "cover" | "contain";
};

export function ArticleBlockRenderer({ content, mediaFit = "cover" }: ArticleBlockRendererProps) {
  const blocks = parseArticleBlocks(content);
  const mediaClassName =
    mediaFit === "contain"
      ? "max-h-[32rem] w-auto"
      : "h-auto w-full";
  const galleryMediaClassName =
    mediaFit === "contain"
      ? "max-h-[18rem] w-auto"
      : "h-52 w-full";

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = block.level === 3 ? "h3" : block.level === 4 ? "h4" : "h2";
          const headingClass =
            block.level === 3
              ? "text-2xl font-extrabold text-[var(--green-deep)]"
              : block.level === 4
                ? "text-xl font-bold text-[var(--green-deep)]"
                : "text-3xl font-extrabold text-[var(--green-deep)]";

          return <HeadingTag key={block.id || index} className={headingClass} dangerouslySetInnerHTML={{ __html: block.html }} />;
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={block.id || index}
              className="rounded-lg border-l-4 border-l-[var(--orange-strong)] bg-[rgba(240,122,20,0.08)] px-5 py-4"
            >
              <div className={richTextClass} dangerouslySetInnerHTML={{ __html: block.html }} />
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
              <PreviewableArticleImage
                src={block.url}
                alt={block.alt || block.caption || "Image article"}
                width={1400}
                height={900}
                imageClassName={mediaClassName}
                caption={block.caption}
              />
            </figure>
          );
        }

        if (block.type === "gallery" && block.images.length > 0) {
          return (
            <section key={block.id || index} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {block.images.map((image) => (
                  <figure key={image.id} className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                    <PreviewableArticleImage
                      src={image.url}
                      alt={image.alt || image.caption || "Image galerie article"}
                      width={900}
                      height={600}
                      imageClassName={galleryMediaClassName}
                      frameClassName="rounded-none border-0 bg-transparent"
                      caption={image.caption}
                    />
                  </figure>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "divider") {
          return <hr key={block.id || index} className="border-[var(--line)]" />;
        }

        if (block.type === "paragraph") {
          return (
            <div
              key={block.id || index}
              className={richTextClass}
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
