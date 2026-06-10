"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INTERNAL_TABS } from "@/lib/constants";

export function SubNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="tri-subnav" aria-label="Internal sub-sections">
      {INTERNAL_TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`tri-subnav-tab${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
