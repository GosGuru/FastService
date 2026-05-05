import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin FastServices",
  description: "Panel interno de gestión de contenido FastServices.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}