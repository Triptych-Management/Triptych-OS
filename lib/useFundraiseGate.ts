"use client";

import { useCallback, useEffect, useState } from "react";

interface UseFundraiseGate {
  checking: boolean;
  authed: boolean;
  /** Call after a successful POST to /api/fundraise-gate. */
  markUnlocked: () => void;
  /** Locks again — clears the cookie server-side and flips local state. */
  lock: () => Promise<void>;
}

export function useFundraiseGate(): UseFundraiseGate {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/fundraise-gate", { cache: "no-store" });
        const data = (await res.json()) as { authed?: boolean };
        if (!cancelled) setAuthed(!!data.authed);
      } catch {
        if (!cancelled) setAuthed(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markUnlocked = useCallback(() => setAuthed(true), []);

  const lock = useCallback(async () => {
    try {
      await fetch("/api/fundraise-gate", { method: "DELETE" });
    } finally {
      setAuthed(false);
    }
  }, []);

  return { checking, authed, markUnlocked, lock };
}
