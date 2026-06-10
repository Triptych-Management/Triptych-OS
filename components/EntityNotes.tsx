"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";

const DEBOUNCE_MS = 1500;

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  /** Unique id; component should be `key`-mounted on this to reset cleanly. */
  entityId: string;
  initial: string;
  /** Called when the debounced/blur save fires. Should resolve once the value
   *  is persisted. Throw to surface a "Save failed" status. */
  onSave: (next: string) => Promise<void>;
  /** Optional placeholder; defaults to the original artist-notes copy. */
  placeholder?: string;
}

// Free-text notes editor with debounced auto-save + save on blur.
// Status line: Editing… → Saving… → Saved.
export function EntityNotes({ entityId, initial, onSave, placeholder }: Props) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [state, setState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(initial);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initial);
    setSaved(initial);
    savedRef.current = initial;
    setState("idle");
  }, [entityId, initial]);

  const persist = useCallback(
    async (next: string) => {
      if (next === savedRef.current) return;
      setState("saving");
      try {
        await onSave(next);
        savedRef.current = next;
        setSaved(next);
        setState("saved");
      } catch (e) {
        setState("error");
        toast.error("Notes failed to save: " + (e as Error).message);
      }
    },
    [onSave]
  );

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
        placeholder={
          placeholder ?? "Ideas, priorities, next steps, random thoughts…"
        }
        spellCheck
      />
    </div>
  );
}
