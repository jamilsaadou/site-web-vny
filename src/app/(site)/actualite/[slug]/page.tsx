import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBlockRenderer } from "@/components/article-block-renderer";
import { ArticleShareButtons } from "@/components/article-share-buttons";
import { PreviewableArticleImage } from "@/components/previewable-article-image";
import { Reveal } from "@/components/reveal";
import { getNewsBySlug, getLatestNews } from "@/lib/news";
import { formatFrenchDate } from "@/lib/utils";

type ActualiteDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ActualiteDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) {
    return {
      title: "Actualité introuvable | Ville de Niamey",
      description: "Cette actualité n'est plus disponible.",
    };
  }

  const headerStore = await headers();
  const origin = getRequestOrigin(headerStore);
  const articleUrl = `${origin}/actualite/${article.slug}`;
  const title = article.seoTitle || `${article.title} | Ville de Niamey`;
  const description = article.seoDescription || article.excerpt;
  const imagePath = article.featuredImage || article.gallery?.[0]?.imagePath;
  const imageUrl = imagePath ? toAbsoluteUrl(origin, imagePath) : undefined;

  return {
    title,
    description,
    keywords: article.seoKeywords || "actualité niamey, mairie",
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: "Ville de Niamey",
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1600,
              height: 1000,
              alt: article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const items = await getLatestNews(30);
  return items.map((item) => ({ slug: item.slug }));
}

function getRequestOrigin(headerStore: Headers) {
  const forwardedHost = headerStore.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headerStore.get("host")?.split(",")[0]?.trim() || "localhost:3000";
  const forwardedProto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

function toAbsoluteUrl(origin: string, path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function ActualiteDetailPage({ params }: ActualiteDetailPageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) {
    notFound();
  }

  const headerStore = await headers();
  const articleUrl = `${getRequestOrigin(headerStore)}/actualite/${article.slug}`;
  const heroImage = article.featuredImage || article.gallery?.[0]?.imagePath;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal className="mx-auto max-w-3xl">
          <Link href="/actualite" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hover:text-[var(--orange-strong)]">
            Actualité / retour à la liste
          </Link>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--orange-strong)]">
            {article.section}
          </p>
          <h1 className="display-font mt-2 text-4xl leading-tight font-extrabold text-[var(--green-deep)] sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-justify text-sm leading-8 text-[var(--muted)]">{article.excerpt}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            {formatFrenchDate(article.publishedAt)} - {article.location}
          </p>
        </Reveal>

        {heroImage ? (
          <Reveal className="mx-auto mt-8 max-w-3xl">
            <PreviewableArticleImage
              src={heroImage}
              alt={article.title}
              width={1600}
              height={1000}
              priority
              imageClassName="max-h-[34rem] w-auto"
            />
          </Reveal>
        ) : null}

        <Reveal className="mx-auto mt-10 max-w-3xl [&_p]:text-justify">
          <ArticleBlockRenderer content={article.content} mediaFit="contain" />
        </Reveal>

        {article.gallery && article.gallery.length > 0 ? (
          <section className="mx-auto mt-12 max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {article.gallery.map((image, index) => (
                <Reveal key={image.id} delay={index * 0.05} className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                  <PreviewableArticleImage
                    src={image.imagePath}
                    alt={image.caption || article.title}
                    width={900}
                    height={600}
                    imageClassName="max-h-[18rem] w-auto"
                    frameClassName="rounded-none border-0 bg-transparent"
                    caption={image.caption}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        <Reveal className="mx-auto mt-10 max-w-3xl">
          <ArticleShareButtons title={article.title} url={articleUrl} />
        </Reveal>
      </section>
    </main>
  );
}
