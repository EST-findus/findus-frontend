"use client";

import { usePathname } from "next/navigation";

/** Route-scoped colors also reach body portals without changing the page layout. */
export default function RoutePalette() {
  const pathname = usePathname();
  return <span hidden aria-hidden="true" data-findus-palette="official" data-findus-surface={pathname === "/community" || pathname === "/help" || pathname.startsWith("/missing/") ? "white" : undefined} />;
}