import type { Metadata, Viewport } from "next";
import { Manrope, Marcellus } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus" });

export const metadata: Metadata = {
  title: {
    default: "FastServices Ibiza",
    template: "%s | FastServices Ibiza"
  },
  description: "Boats, private transfers and water toys coordinated from one conversation with Rodrigo.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fastservices.example")
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#76abc4"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${marcellus.variable}`}>
      <body>{children}</body>
    </html>
  );
}
