"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppProvider";
import { UserManager } from "./UserManager";

export function UserSwitcher() {
  const { users, currentUser, setCurrentUserId, ready } = useApp();
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Click-outside to close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!ready) return <div className="tri-user-trigger tri-user-skeleton" aria-hidden />;

  return (
    <>
      <div className="tri-user-wrap" ref={wrapRef}>
        <button
          type="button"
          className="tri-user-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {currentUser ? (
            <>
              <span
                className="tri-avatar"
                style={{ backgroundColor: currentUser.color }}
                aria-hidden
              >
                {currentUser.initial}
              </span>
              <span className="tri-user-name">{currentUser.name}</span>
            </>
          ) : (
            <span className="tri-user-name tri-user-name-prompt">
              Choose user
            </span>
          )}
          <span className="tri-user-chev" aria-hidden>
            ▾
          </span>
        </button>

        {open && (
          <div className="tri-user-menu" role="menu">
            <div className="tri-user-menu-label">Switch user</div>
            {users.map((u) => (
              <button
                key={u.id}
                role="menuitemradio"
                aria-checked={currentUser?.id === u.id}
                className={`tri-user-menu-item${
                  currentUser?.id === u.id ? " is-active" : ""
                }`}
                onClick={() => {
                  setCurrentUserId(u.id);
                  setOpen(false);
                }}
              >
                <span
                  className="tri-avatar tri-avatar-sm"
                  style={{ backgroundColor: u.color }}
                  aria-hidden
                >
                  {u.initial}
                </span>
                <span className="tri-user-menu-item-name">{u.name}</span>
                {u.is_admin && (
                  <span className="tri-user-menu-item-tag">ADMIN</span>
                )}
              </button>
            ))}
            {currentUser?.is_admin && (
              <>
                <div className="tri-user-menu-divider" />
                <button
                  className="tri-user-menu-item tri-user-menu-manage"
                  onClick={() => {
                    setManageOpen(true);
                    setOpen(false);
                  }}
                  role="menuitem"
                >
                  Manage users…
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {manageOpen && <UserManager onClose={() => setManageOpen(false)} />}
    </>
  );
}
