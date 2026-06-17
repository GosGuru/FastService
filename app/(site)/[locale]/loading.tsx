"use client";

import { useParams } from "next/navigation";
import { PremiumRouteLoader } from "@/components/layout/PremiumRouteLoader";
import { assertLocale, type Locale } from "@/lib/i18n";

export default function SiteRouteLoading() {
  const params = useParams();
  const locale = assertLocale(typeof params?.locale === "string" ? params.locale : "es") as Locale;

  return <PremiumRouteLoader locale={locale} />;
}
