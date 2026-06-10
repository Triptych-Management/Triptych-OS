"use client";

import { useEffect, useState } from "react";
import {
  archiveClient,
  createClient,
  updateClient,
} from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useApp } from "./AppProvider";

export function ClientManager({ onClose }: { onClose: () => void }) {
  const { clients, reloadClients, currentUser } = useApp();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!currentUser?.is_admin) return null;

  const onAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createClient({ name: name.trim() });
      setName("");
      await reloadClients();
      toast.success("Client added");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onRename = async (id: string, current: string) => {
    const next = prompt("Rename client", current);
    if (!next || next.trim() === current) return;
    try {
      await updateClient(id, { name: next.trim() });
      await reloadClients();
      toast.success("Client renamed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onArchive = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? Tasks and notes stay; tab is hidden.`))
      return;
    try {
      await archiveClient(id);
      await reloadClients();
      toast.success("Client archived");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onMove = async (id: string, direction: "up" | "down") => {
    const ordered = [...clients].sort((a, b) => a.position - b.position);
    const idx = ordered.findIndex((c) => c.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) return;
    const a = ordered[idx];
    const b = ordered[swapIdx];
    try {
      await Promise.all([
        updateClient(a.id, { position: b.position }),
        updateClient(b.id, { position: a.position }),
      ]);
      await reloadClients();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const sorted = [...clients].sort((a, b) => a.position - b.position);

  return (
    <div className="tri-modal-backdrop" onClick={onClose}>
      <div
        className="tri-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tri-modal-header">
          <h2 id="client-manager-title" className="tri-modal-title">
            Manage clients
          </h2>
          <button onClick={onClose} className="tri-modal-close" aria-label="Close">
            ×
          </button>
        </header>

        <section className="tri-modal-section">
          <div className="tri-modal-section-label">Add a client</div>
          <div className="tri-user-form">
            <input
              className="tri-input"
              placeholder="Client name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onAdd();
              }}
            />
            <button
              className="tri-btn tri-btn-primary"
              onClick={onAdd}
              disabled={!name.trim() || saving}
            >
              {saving ? "Adding…" : "Add"}
            </button>
          </div>
        </section>

        <section className="tri-modal-section">
          <div className="tri-modal-section-label">Active clients</div>
          <ul className="tri-user-list">
            {sorted.map((c, idx) => (
              <li key={c.id} className="tri-user-list-row">
                <span className="tri-artist-pos">{idx + 1}</span>
                <span className="tri-user-list-name">{c.name}</span>
                <button
                  className="tri-icon-btn"
                  onClick={() => onMove(c.id, "up")}
                  disabled={idx === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  className="tri-icon-btn"
                  onClick={() => onMove(c.id, "down")}
                  disabled={idx === sorted.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  className="tri-pill"
                  onClick={() => onRename(c.id, c.name)}
                >
                  Rename
                </button>
                <button
                  className="tri-link-danger"
                  onClick={() => onArchive(c.id, c.name)}
                >
                  Archive
                </button>
              </li>
            ))}
            {sorted.length === 0 && (
              <li className="tri-empty" style={{ marginTop: 8 }}>
                No clients yet.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
