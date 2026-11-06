"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { MediaImage } from "@/components/MediaImage";
import { getBoatNavigation } from "@/data/navigation";
import { applyTemplate, uiLabels, type Locale } from "@/lib/i18n";
import type { BoatCollection } from "@/types/content";

interface DesktopMegaMenuProps {
	locale: Locale;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	boatCollections: BoatCollection[];
}

export function DesktopMegaMenu({
	locale,
	open,
	onOpenChange,
	boatCollections,
}: DesktopMegaMenuProps) {
	const ref = useRef<HTMLDetailsElement>(null);
	const initialSync = useRef(true);
	const items = getBoatNavigation(locale, { boatCollections });
	const labels = uiLabels[locale];
	const handleOpenChange = useEffectEvent(onOpenChange);

	useEffect(() => {
		if (ref.current?.open) handleOpenChange(true);
	}, []);

	useEffect(() => {
		if (initialSync.current) {
			initialSync.current = false;
			return;
		}
		if (ref.current && ref.current.open !== open) ref.current.open = open;
	}, [open]);

	useEffect(() => {
		if (!open) return;

		function onPointerDown(event: PointerEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				handleOpenChange(false);
			}
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				handleOpenChange(false);
			}
		}

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<details className="nav-dropdown nav-dropdown--boats" ref={ref} onToggle={(event) => onOpenChange(event.currentTarget.open)}>
			<summary
				className={`nav-link nav-link--dropdown ${open ? "is-open" : ""}`}
				aria-controls="boat-mega-menu"
			>
				{labels.boats}
				<FiChevronDown aria-hidden="true" />
			</summary>
			<div
				className="mega-menu is-open"
				id="boat-mega-menu"
				aria-label={labels.ariaBoatCollections}
			>
				<div className="mega-menu__grid">
					{items.map((item) => (
						<Link
							className="mega-card"
							href={item.href}
							key={item.id}
							onClick={() => onOpenChange(false)}
						>
							<span className="mega-card__tag">{item.label}</span>
							{item.priceTag && (
								<span className="mega-card__badge">{item.priceTag}</span>
							)}
							<span className="mega-card__image">
								<MediaImage asset={item.image} locale={locale} sizes="25vw" />
							</span>
							<span className="mega-card__title">
								{applyTemplate(labels.megaMenuRentInIbiza, {
									label: item.label,
								})}
							</span>
						</Link>
					))}
				</div>
			</div>
		</details>
	);
}
