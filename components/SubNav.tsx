"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INTERNAL_TABS } from "@/lib/constants";
import { canViewFundraise } from "@/lib/auth";
import { useApp } from "./AppProvider";

export function SubNav() {
  const pathname = usePathname() ?? "";
  const { currentUser } = useApp();

  const visibleTabs = INTERNAL_TABS.filter((t) => {
    if (t.id === "fundraise") return canViewFundraise(currentUser);
    return true;
  });

  return (
    <nav className="tri-subnav" aria-label="Internal sub-sections">
      {visibleTabs.map((t) => {
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
