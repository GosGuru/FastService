import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { posts } from "@/data/posts";
import { buildHomeAlternates } from "@/lib/content";
import { assertLocale, getLocalizedSlug, getLocalizedValue, uiLabels, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  return {
    title: uiLabels[locale].news,
    description: locale === "es" ? "Ideas para vivir Ibiza con FastServices." : "Ideas to experience Ibiza with FastServices.",
    alternates: { languages: buildHomeAlternates() }
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale) as Locale;

  return (
    <main className="section page-offset">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">FastServices</p>
          <h1>{uiLabels[locale].news}</h1>
        </div>
        <div className="content-grid content-grid--three">
          {posts.map((post) => (
            <Link href={`/${locale}/blog/${getLocalizedSlug(post.slugsByLocale, locale)}`} className="post-card" key={post.id}>
              <span className="post-card__image"><MediaImage asset={post.image} locale={locale} /></span>
              <span className="post-card__body">
                <small>{getLocalizedValue(post.category, locale)}</small>
                <strong>{getLocalizedValue(post.title, locale)}</strong>
                <span>{getLocalizedValue(post.excerpt, locale)}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}