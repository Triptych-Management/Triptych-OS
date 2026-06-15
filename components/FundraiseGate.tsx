"use client";

import { useEffect, useRef, useState } from "react";

export function FundraiseGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    if (!password) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/fundraise-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Incorrect password" : "Something went wrong");
        return;
      }
      onUnlock();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tri-fundraise-gate">
      <form
        className="tri-fundraise-gate-card"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <span className="tri-placeholder-eyebrow">Locked</span>
        <h1 className="tri-placeholder-title">Fundraise</h1>
        <p className="tri-placeholder-hint">
          Enter the access password to continue. You&apos;ll stay unlocked
          for a week on this browser.
        </p>
        <input
          ref={inputRef}
          type="password"
          className="tri-input tri-fundraise-gate-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <div className="tri-fundraise-gate-error">{error}</div>}
        <button
          type="submit"
          className="tri-btn tri-btn-primary tri-fundraise-gate-submit"
          disabled={!password || submitting}
        >
          {submitting ? "Unlocking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
