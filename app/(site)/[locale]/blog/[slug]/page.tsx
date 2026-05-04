import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaImage } from "@/components/MediaImage";
import { buildAlternates, getAllPostPaths, getPostBySlug } from "@/lib/content";
import { assertLocale, getLocalizedSlug, getLocalizedValue, siteUrl, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getAllPostPaths();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  const post = getPostBySlug(locale, slug);

  if (!post) return {};

  return {
    title: getLocalizedValue(post.seoTitle, locale),
    description: getLocalizedValue(post.seoDescription, locale),
    alternates: {
      canonical: `${siteUrl}/${locale}/blog/${getLocalizedSlug(post.slugsByLocale, locale)}`,
      languages: buildAlternates({ es: "blog", en: "blog" }, `/${getLocalizedSlug(post.slugsByLocale, locale)}`)
    }
  };
}

export default async function PostPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale) as Locale;
  const post = getPostBySlug(locale, slug);

  if (!post) notFound();

  return (
    <main>
      <section className="page-hero page-hero--compact">
        <div className="page-hero__media"><MediaImage asset={post.image} locale={locale} sizes="100vw" priority /></div>
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <p className="eyebrow">{getLocalizedValue(post.category, locale)}</p>
          <h1>{getLocalizedValue(post.title, locale)}</h1>
          <p>{getLocalizedValue(post.excerpt, locale)}</p>
        </div>
      </section>
      <article className="section">
        <div className="container narrow-copy">
          {post.body.map((paragraph) => (
            <p key={paragraph.es}>{getLocalizedValue(paragraph, locale)}</p>
          ))}
        </div>
      </article>
    </main>
  );
}