"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PremiumNotFoundContent } from "@/components/layout/PremiumNotFoundContent";
import { isLocale, uiLabels, type Locale } from "@/lib/i18n";

type Props = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function LocaleError({ error }: Props) {
	const params = useParams<{ locale?: string }>();
	const locale: Locale =
		params?.locale && isLocale(params.locale) ? params.locale : "es";

	useEffect(() => {
		console.error(error);
	}, [error]);

	const isSpanish = locale === "es";

	const labels = uiLabels[locale];

	return (
		<PremiumNotFoundContent
			locale={locale}
			eyebrow={labels.errorEyebrow}
			title={labels.errorTitle}
			description={labels.errorDescription}
			question={labels.errorQuestion}
			note={labels.errorNote}
		/>
	);
}
