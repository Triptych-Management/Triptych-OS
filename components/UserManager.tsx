"use client";

import { useEffect, useState } from "react";
import { archiveUser, createUser, updateUser } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useApp } from "./AppProvider";

const PALETTE = [
  "#2C3BD3", // tri-blue
  "#E85533", // orange
  "#1E8C4E", // green
  "#A87308", // amber
  "#C94040", // red
  "#6D28D9", // violet
  "#0369A1", // sky
  "#0A0A2E", // ink
];

export function UserManager({ onClose }: { onClose: () => void }) {
  const { users, reloadUsers, currentUser } = useApp();
  const [name, setName] = useState("");
  const [initial, setInitial] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!currentUser?.is_admin) {
    // Defense in depth — this component should only render for admins.
    return null;
  }

  const onAdd = async () => {
    if (!name.trim() || !initial.trim()) return;
    setSaving(true);
    try {
      await createUser({ name: name.trim(), initial: initial.trim(), color });
      setName("");
      setInitial("");
      setColor(PALETTE[0]);
      await reloadUsers();
      toast.success("User added");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onArchive = async (id: string) => {
    if (id === currentUser.id) {
      toast.error("Can't archive yourself");
      return;
    }
    if (!confirm("Archive this user? Their tasks stay; they just can't log in.")) {
      return;
    }
    try {
      await archiveUser(id);
      await reloadUsers();
      toast.success("User archived");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onToggleAdmin = async (id: string, makeAdmin: boolean) => {
    try {
      await updateUser(id, { is_admin: makeAdmin });
      await reloadUsers();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="tri-modal-backdrop" onClick={onClose}>
      <div
        className="tri-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tri-modal-header">
          <h2 id="user-manager-title" className="tri-modal-title">
            Manage users
          </h2>
          <button onClick={onClose} className="tri-modal-close" aria-label="Close">
            ×
          </button>
        </header>

        <section className="tri-modal-section">
          <div className="tri-modal-section-label">Add a user</div>
          <div className="tri-user-form">
            <input
              className="tri-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!initial && e.target.value)
                  setInitial(e.target.value.trim().slice(0, 2).toUpperCase());
              }}
            />
            <input
              className="tri-input tri-input-narrow"
              placeholder="AB"
              maxLength={2}
              value={initial}
              onChange={(e) => setInitial(e.target.value.toUpperCase())}
            />
            <div className="tri-color-swatches" role="radiogroup" aria-label="Color">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={c === color}
                  className={`tri-color-swatch${c === color ? " is-active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <button
              className="tri-btn tri-btn-primary"
              onClick={onAdd}
              disabled={!name.trim() || !initial.trim() || saving}
            >
              {saving ? "Adding…" : "Add"}
            </button>
          </div>
        </section>

        <section className="tri-modal-section">
          <div className="tri-modal-section-label">Active users</div>
          <ul className="tri-user-list">
            {users.map((u) => (
              <li key={u.id} className="tri-user-list-row">
                <span
                  className="tri-avatar tri-avatar-sm"
                  style={{ backgroundColor: u.color }}
                  aria-hidden
                >
                  {u.initial}
                </span>
                <span className="tri-user-list-name">{u.name}</span>
                <button
                  className={`tri-pill${u.is_admin ? " is-on" : ""}`}
                  onClick={() => onToggleAdmin(u.id, !u.is_admin)}
                  title={u.is_admin ? "Revoke admin" : "Grant admin"}
                >
                  {u.is_admin ? "Admin" : "Member"}
                </button>
                <button
                  className="tri-link-danger"
                  onClick={() => onArchive(u.id)}
                  disabled={u.id === currentUser.id}
                >
                  Archive
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
