import type { NextConfig } from "next";

function getSupabaseHostname() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
}

const supabaseHostnames = Array.from(new Set([getSupabaseHostname(), "uuvpspxnijthjwmksrer.supabase.co"].filter((hostname): hostname is string => Boolean(hostname))));

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd()
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com"
      },
      ...supabaseHostnames.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/**"
      }))
    ]
  }
};

export default nextConfig;