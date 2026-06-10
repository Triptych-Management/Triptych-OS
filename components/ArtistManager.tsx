"use client";

import { useEffect, useState } from "react";
import {
  archiveArtist,
  createArtist,
  updateArtist,
} from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useApp } from "./AppProvider";

export function ArtistManager({ onClose }: { onClose: () => void }) {
  const { artists, reloadArtists, currentUser } = useApp();
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
      await createArtist({ name: name.trim() });
      setName("");
      await reloadArtists();
      toast.success("Artist added");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onRename = async (id: string, current: string) => {
    const next = prompt("Rename artist", current);
    if (!next || next.trim() === current) return;
    try {
      await updateArtist(id, { name: next.trim() });
      await reloadArtists();
      toast.success("Artist renamed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onArchive = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? Tasks and notes stay; tab is hidden.`))
      return;
    try {
      await archiveArtist(id);
      await reloadArtists();
      toast.success("Artist archived");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onMove = async (id: string, direction: "up" | "down") => {
    const ordered = [...artists].sort((a, b) => a.position - b.position);
    const idx = ordered.findIndex((a) => a.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) return;
    const a = ordered[idx];
    const b = ordered[swapIdx];
    try {
      await Promise.all([
        updateArtist(a.id, { position: b.position }),
        updateArtist(b.id, { position: a.position }),
      ]);
      await reloadArtists();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const sorted = [...artists].sort((a, b) => a.position - b.position);

  return (
    <div className="tri-modal-backdrop" onClick={onClose}>
      <div
        className="tri-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tri-modal-header">
          <h2 id="artist-manager-title" className="tri-modal-title">
            Manage artists
          </h2>
          <button onClick={onClose} className="tri-modal-close" aria-label="Close">
            ×
          </button>
        </header>

        <section className="tri-modal-section">
          <div className="tri-modal-section-label">Add an artist</div>
          <div className="tri-user-form">
            <input
              className="tri-input"
              placeholder="Artist or group name"
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
          <div className="tri-modal-section-label">Roster</div>
          <ul className="tri-user-list">
            {sorted.map((a, idx) => (
              <li key={a.id} className="tri-user-list-row">
                <span className="tri-artist-pos">{idx + 1}</span>
                <span className="tri-user-list-name">{a.name}</span>
                <button
                  className="tri-icon-btn"
                  onClick={() => onMove(a.id, "up")}
                  disabled={idx === 0}
                  aria-label="Move up"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="tri-icon-btn"
                  onClick={() => onMove(a.id, "down")}
                  disabled={idx === sorted.length - 1}
                  aria-label="Move down"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  className="tri-pill"
                  onClick={() => onRename(a.id, a.name)}
                  title="Rename"
                >
                  Rename
                </button>
                <button
                  className="tri-link-danger"
                  onClick={() => onArchive(a.id, a.name)}
                >
                  Archive
                </button>
              </li>
            ))}
            {sorted.length === 0 && (
              <li className="tri-empty" style={{ marginTop: 8 }}>
                No artists on the roster yet.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
