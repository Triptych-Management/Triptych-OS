"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/constants";
import { useApp } from "./AppProvider";
import { UserSwitcher } from "./UserSwitcher";

export function TopNav() {
  const pathname = usePathname() ?? "";
  const { adminMode, currentUser, openUserManager } = useApp();
  const showAdminControls = adminMode && currentUser?.is_admin;

  return (
    <header className={`tri-topnav${showAdminControls ? " is-admin" : ""}`}>
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
        {showAdminControls && (
          <>
            <span className="tri-admin-badge" aria-live="polite">
              Admin
            </span>
            <button
              type="button"
              className="tri-admin-add-btn"
              onClick={openUserManager}
              title="Add or manage users"
            >
              <span aria-hidden>+</span>
              <span className="tri-admin-add-btn-label">Add user</span>
            </button>
          </>
        )}
        <UserSwitcher />
      </div>
    </header>
  );
}
