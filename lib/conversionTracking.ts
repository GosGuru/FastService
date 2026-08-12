export interface WhatsAppClickEvent {
	placement: string;
	route: string;
	locale: string;
	boatId?: string;
	category?: string;
}

declare global {
	interface Window {
		dataLayer?: Record<string, unknown>[];
	}
}

export function trackWhatsAppClick(event: Omit<WhatsAppClickEvent, "route">) {
	if (typeof window === "undefined") return;

	const detail: WhatsAppClickEvent = { ...event, route: window.location.pathname };
	window.dataLayer?.push({ event: "wa_click", ...detail });
	window.dispatchEvent(new CustomEvent("fastservice:wa_click", { detail }));
}
