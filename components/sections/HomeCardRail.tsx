import type { ReactNode } from "react";

interface HomeCardRailProps {
  children: ReactNode;
}

export function HomeCardRail({ children }: HomeCardRailProps) {
  return <div className="content-grid content-grid--three home-card-rail">{children}</div>;
}
