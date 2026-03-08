import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBlockRenderer } from "@/components/article-block-renderer";
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

  return {
    title: article.seoTitle || `${article.title} | Ville de Niamey`,
    description: article.seoDescription || article.excerpt,
    keywords: article.seoKeywords || "actualité niamey, mairie",
  };
}

export async function generateStaticParams() {
  const items = await getLatestNews(30);
  return items.map((item) => ({ slug: item.slug }));
}

export default async function ActualiteDetailPage({ params }: ActualiteDetailPageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) {
    notFound();
  }

  const heroImage = article.featuredImage || article.gallery?.[0]?.imagePath;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <Link href="/actualite" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hover:text-[var(--orange-strong)]">
            Actualité / retour à la liste
          </Link>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--orange-strong)]">
            {article.section}
          </p>
          <h1 className="display-font mt-2 text-4xl leading-tight font-extrabold text-[var(--green-deep)] sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{article.excerpt}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            {formatFrenchDate(article.publishedAt)} - {article.location}
          </p>
        </Reveal>

        {heroImage ? (
          <Reveal className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)]">
            <Image
              src={heroImage}
              alt={article.title}
              width={1600}
              height={1000}
              className="h-auto w-full object-cover"
            />
          </Reveal>
        ) : null}

        <Reveal className="mt-10">
          <ArticleBlockRenderer content={article.content} />
        </Reveal>

        {article.gallery && article.gallery.length > 0 ? (
          <section className="mt-12">
            <Reveal>
              <h2 className="text-2xl font-extrabold text-[var(--green-deep)]">Galerie</h2>
            </Reveal>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {article.gallery.map((image, index) => (
                <Reveal key={image.id} delay={index * 0.05} className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                  <Image
                    src={image.imagePath}
                    alt={image.caption || article.title}
                    width={900}
                    height={600}
                    className="h-44 w-full object-cover"
                  />
                  {image.caption ? <p className="px-3 py-2 text-xs text-[var(--muted)]">{image.caption}</p> : null}
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
