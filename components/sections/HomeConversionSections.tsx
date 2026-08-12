import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BoatCard } from "@/components/boats/BoatCard";
import { MediaImage } from "@/components/MediaImage";
import { getLocalizedSlug, getLocalizedValue, type Locale } from "@/lib/i18n";
import type { Boat, BoatCollection, BoatCollectionId } from "@/types/content";
import type { HomeSettings } from "@/types/settings";

interface HomeConversionSectionsProps {
	boats: Boat[];
	collections: BoatCollection[];
	locale: Locale;
	settings: HomeSettings;
}

const copy: Record<Locale, {
	allBoats: string;
}> = {
	es: {
		allBoats: "Explorar categorías",
	},
	en: {
		allBoats: "Explore categories",
	},
	de: {
		allBoats: "Kategorien entdecken",
	},
	nl: {
		allBoats: "Ontdek categorieën",
	},
	ru: {
		allBoats: "Посмотреть категории",
	},
};

const categoryNames: Record<BoatCollectionId, Record<Locale, string>> = {
	"yachts-xl": { es: "Yates XL", en: "XL yachts", de: "XL-Yachten", nl: "XL-jachten", ru: "XL-яхты" },
	yachts: { es: "Yates", en: "Yachts", de: "Yachten", nl: "Jachten", ru: "Яхты" },
	"fast-boats": { es: "Embarcaciones rápidas", en: "Fast boats", de: "Schnellboote", nl: "Snelle boten", ru: "Катера" },
};

export function HomeConversionSections({ boats, collections, locale, settings }: HomeConversionSectionsProps) {
	const labels = copy[locale];
	const boatsById = new Map(boats.map((boat) => [boat.id, boat]));
	const collectionsById = new Map(collections.map((collection) => [collection.collectionId, collection]));
	const featuredBoats = settings.featured.boatIds.flatMap((id) => {
		const boat = boatsById.get(id);
		return boat ? [boat] : [];
	});
	const orderedCollections = settings.categories.collectionIds.flatMap((id) => {
		const collection = collectionsById.get(id);
		return collection ? [collection] : [];
	});
	const collectionHref = (collection: BoatCollection) => `/${locale}/${getLocalizedSlug(collection.slugsByLocale, locale)}`;

	return (
		<div className="conversion-home">
			{featuredBoats.length ? (
				<section className="conversion-featured" id="barcos-destacados" aria-labelledby="conversion-featured-title">
					<div className="container">
						<div className="conversion-heading conversion-heading--center">
							<h2 id="conversion-featured-title">{getLocalizedValue(settings.featured.title, locale)}</h2>
							<p>{getLocalizedValue(settings.featured.description, locale)}</p>
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
						<h2 id="conversion-categories-title">{getLocalizedValue(settings.categories.title, locale)}</h2>
					</div>
					<div className="conversion-categories__grid">
						{orderedCollections.map((collection) => (
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
