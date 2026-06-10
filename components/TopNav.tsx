"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/constants";
import { UserSwitcher } from "./UserSwitcher";

export function TopNav() {
  const pathname = usePathname() ?? "";
  return (
    <header className="tri-topnav">
      <Link href="/internal/tasks" className="tri-brand" aria-label="Triptych OS home">
        <span className="tri-brand-mark">TRIPTYCH</span>
        <span className="tri-brand-os">OS</span>
      </Link>
      <nav className="tri-topnav-tabs" aria-label="Primary">
        {PAGES.map((p) => {
          const active = pathname.startsWith(`/${p.id}`);
          return (
            <Link
              key={p.id}
              href={p.href}
              className={`tri-topnav-tab${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {p.label}
            </Link>
          );
        })}
      </nav>
      <div className="tri-topnav-right">
        <UserSwitcher />
      </div>
    </header>
  );
}
