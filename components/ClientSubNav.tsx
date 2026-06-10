"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";

export function ClientSubNav() {
  const pathname = usePathname() ?? "";
  const { clients, adminMode, currentUser, openClientManager } = useApp();
  const sorted = [...clients].sort((a, b) => a.position - b.position);
  const showAdmin = adminMode && currentUser?.is_admin;

  return (
    <nav className="tri-subnav tri-subnav-artists" aria-label="Clients">
      {sorted.map((c) => {
        const href = `/marketing/${c.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={c.id}
            href={href}
            className={`tri-subnav-tab${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {c.name}
          </Link>
        );
      })}
      {showAdmin && (
        <button
          type="button"
          className="tri-subnav-manage"
          onClick={openClientManager}
          title="Add / edit / archive clients"
        >
          <span aria-hidden>+</span>
          <span>Manage</span>
        </button>
      )}
    </nav>
  );
}
