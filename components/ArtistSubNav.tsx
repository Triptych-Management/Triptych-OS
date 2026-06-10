"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";

export function ArtistSubNav() {
  const pathname = usePathname() ?? "";
  const { artists, adminMode, currentUser, openArtistManager } = useApp();
  const sorted = [...artists].sort((a, b) => a.position - b.position);
  const showAdmin = adminMode && currentUser?.is_admin;

  return (
    <nav className="tri-subnav tri-subnav-artists" aria-label="Artists">
      {sorted.map((a) => {
        const href = `/management/${a.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={a.id}
            href={href}
            className={`tri-subnav-tab${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {a.name}
          </Link>
        );
      })}
      {showAdmin && (
        <button
          type="button"
          className="tri-subnav-manage"
          onClick={openArtistManager}
          title="Add / edit / archive artists"
        >
          <span aria-hidden>+</span>
          <span>Manage</span>
        </button>
      )}
    </nav>
  );
}
