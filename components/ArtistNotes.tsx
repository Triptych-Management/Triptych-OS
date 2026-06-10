"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updateArtist } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useApp } from "./AppProvider";

const DEBOUNCE_MS = 1500;

type SaveState = "idle" | "saving" | "saved" | "error";

export function ArtistNotes({
  artistId,
  initial,
}: {
  artistId: string;
  initial: string;
}) {
  const { patchArtistLocal } = useApp();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [state, setState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(initial);

  // Reset when navigating to a different artist. The setState calls are
  // syncing local draft with the externally-supplied initial — the effect's
  // purpose. The component is also keyed on artistId by its parent so this
  // mostly fires on real artist changes, not on every parent re-render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initial);
    setSaved(initial);
    savedRef.current = initial;
    setState("idle");
  }, [artistId, initial]);

  const persist = useCallback(
    async (next: string) => {
      if (next === savedRef.current) return;
      setState("saving");
      try {
        await updateArtist(artistId, { notes: next });
        savedRef.current = next;
        setSaved(next);
        setState("saved");
        patchArtistLocal(artistId, { notes: next });
      } catch (e) {
        setState("error");
        toast.error("Notes failed to save: " + (e as Error).message);
      }
    },
    [artistId, patchArtistLocal]
  );

  // Debounced auto-save while typing.
  useEffect(() => {
    if (value === saved) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persist(value);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, saved, persist]);

  const onBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value !== savedRef.current) void persist(value);
  };

  const dirty = value !== saved;

  return (
    <div className="tri-notes">
      <div className="tri-notes-head">
        <span className="tri-notes-label">Notes</span>
        <span
          className={`tri-notes-status tri-notes-status-${
            dirty ? "editing" : state
          }`}
          aria-live="polite"
        >
          {dirty
            ? "Editing…"
            : state === "saving"
              ? "Saving…"
              : state === "saved"
                ? "Saved"
                : state === "error"
                  ? "Save failed"
                  : ""}
        </span>
      </div>
      <textarea
        className="tri-notes-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        placeholder="Ideas, priorities, next steps, random thoughts…"
        spellCheck
      />
    </div>
  );
}
