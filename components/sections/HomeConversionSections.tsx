import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BoatCard } from "@/components/boats/BoatCard";
import { MediaImage } from "@/components/MediaImage";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import type { Boat, BoatCollection, BoatCollectionId } from "@/types/content";

interface HomeConversionSectionsProps {
	boats: Boat[];
	collections: BoatCollection[];
	locale: Locale;
}

const copy: Record<Locale, {
	featuredTitle: string;
	featuredBody: string;
	allBoats: string;
	categoriesTitle: string;
}> = {
	es: {
		featuredTitle: "Barcos destacados",
		featuredBody: "Algunos de nuestros barcos más demandados.",
		allBoats: "Explorar categorías",
		categoriesTitle: "Tres formas de vivir el Mediterráneo",
	},
	en: {
		featuredTitle: "Featured boats",
		featuredBody: "Some of our most requested boats.",
		allBoats: "Explore categories",
		categoriesTitle: "Three ways to experience the Mediterranean",
	},
	de: {
		featuredTitle: "Ausgewählte Boote",
		featuredBody: "Einige unserer gefragtesten Boote.",
		allBoats: "Kategorien entdecken",
		categoriesTitle: "Drei Arten, das Mittelmeer zu erleben",
	},
	nl: {
		featuredTitle: "Uitgelichte boten",
		featuredBody: "Enkele van onze meest gevraagde boten.",
		allBoats: "Ontdek categorieën",
		categoriesTitle: "Drie manieren om de Middellandse Zee te beleven",
	},
	ru: {
		featuredTitle: "Популярные яхты",
		featuredBody: "Некоторые из наших самых востребованных яхт.",
		allBoats: "Посмотреть категории",
		categoriesTitle: "Три способа открыть Средиземное море",
	},
};

const categoryNames: Record<BoatCollectionId, Record<Locale, string>> = {
	"yachts-xl": { es: "Superyates", en: "Superyachts", de: "Superyachten", nl: "Superjachten", ru: "Суперъяхты" },
	yachts: { es: "Yates", en: "Yachts", de: "Yachten", nl: "Jachten", ru: "Яхты" },
	"fast-boats": { es: "Lanchas rápidas", en: "Fast boats", de: "Schnellboote", nl: "Snelle boten", ru: "Катера" },
};

function selectFeaturedBoats(boats: Boat[]) {
	const selected: Boat[] = [];
	for (const collectionId of ["yachts-xl", "yachts", "fast-boats"] as BoatCollectionId[]) {
		const boat = boats.find((item) => item.collectionId === collectionId && !selected.includes(item));
		if (boat) selected.push(boat);
	}
	for (const boat of boats) {
		if (selected.length === 4) break;
		if (!selected.includes(boat)) selected.push(boat);
	}
	return selected;
}

export function HomeConversionSections({ boats, collections, locale }: HomeConversionSectionsProps) {
	const labels = copy[locale];
	const featuredBoats = selectFeaturedBoats(boats);
	const collectionHref = (collection: BoatCollection) => `/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`;

	return (
		<div className="conversion-home">
			{featuredBoats.length ? (
				<section className="conversion-featured" id="barcos-destacados" aria-labelledby="conversion-featured-title">
					<div className="container">
						<div className="conversion-heading conversion-heading--center">
							<h2 id="conversion-featured-title">{labels.featuredTitle}</h2>
							<p>{labels.featuredBody}</p>
						</div>
						<div className="conversion-featured__rail">
							{featuredBoats.map((boat) => <BoatCard boat={boat} locale={locale} key={boat.id} />)}
						</div>
						<Link href="#tipos-de-barco" className="conversion-outline-link">{labels.allBoats}<FiArrowRight aria-hidden="true" /></Link>
					</div>
				</section>
			) : null}

			<section className="conversion-categories" id="tipos-de-barco" aria-labelledby="conversion-categories-title">
				<div className="container">
					<div className="conversion-heading conversion-heading--center">
						<h2 id="conversion-categories-title">{labels.categoriesTitle}</h2>
					</div>
					<div className="conversion-categories__grid">
						{collections.map((collection) => (
							<Link href={collectionHref(collection)} className="conversion-category" key={collection.id}>
								<MediaImage asset={collection.image} locale={locale} sizes="(max-width: 760px) 92vw, 30vw" />
								<span className="conversion-category__overlay" />
								<span className="conversion-category__content"><small>{categoryNames[collection.collectionId][locale]}</small><strong>{getLocalizedValue(collection.title, locale)}</strong><FiArrowRight aria-hidden="true" /></span>
							</Link>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
