"use client";

import { useEffect, useRef, useState } from "react";
import { updateFundraiseTarget } from "@/lib/api-client";
import { toast } from "@/lib/toast";

interface Props {
  target: number;
  committed: number;
  wired: number;
  onTargetSaved: (next: number) => void;
}

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function FundraiseProgressBar({
  target,
  committed,
  wired,
  onTargetSaved,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(target));
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync local draft when the persisted target changes (poll or other user).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(String(target));
  }, [target]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = async () => {
    setEditing(false);
    const n = Number(draft);
    if (Number.isNaN(n) || n < 0) {
      setDraft(String(target));
      toast.error("Target must be a non-negative number");
      return;
    }
    if (n === target) return;
    try {
      const saved = await updateFundraiseTarget(n);
      onTargetSaved(saved.target_amount);
    } catch (e) {
      toast.error((e as Error).message);
      setDraft(String(target));
    }
  };

  // Percentages — capped at 100 so an oversubscribed round looks full
  // rather than bursting out of the bar.
  const committedPct = target > 0 ? Math.min(100, (committed / target) * 100) : 0;
  const wiredPct = target > 0 ? Math.min(100, (wired / target) * 100) : 0;
  const towardGoal = target > 0 ? Math.round((committed / target) * 100) : 0;

  return (
    <section className="tri-fundraise-progress" aria-label="Fundraise progress">
      <div className="tri-fundraise-progress-head">
        <div className="tri-fundraise-stats">
          <Stat label="Wired" value={fmtMoney(wired)} kind="wired" />
          <Stat label="Committed" value={fmtMoney(committed)} kind="committed" />
          <Stat label="Target" value={fmtMoney(target)} kind="target">
            {!editing && (
              <button
                type="button"
                className="tri-link"
                onClick={() => setEditing(true)}
                title="Edit target"
              >
                Edit
              </button>
            )}
          </Stat>
        </div>
        <div className="tri-fundraise-pct" aria-live="polite">
          {towardGoal}% to goal
        </div>
      </div>

      {editing && (
        <div className="tri-fundraise-edit">
          <span className="tri-fundraise-edit-label">New target</span>
          <input
            ref={inputRef}
            className="tri-input"
            type="number"
            min={0}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commit();
              if (e.key === "Escape") {
                setDraft(String(target));
                setEditing(false);
              }
            }}
          />
        </div>
      )}

      <div
        className="tri-progress-track"
        role="progressbar"
        aria-valuenow={Math.round(committedPct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="tri-progress-fill tri-progress-committed"
          style={{ width: `${committedPct}%` }}
        />
        <div
          className="tri-progress-fill tri-progress-wired"
          style={{ width: `${wiredPct}%` }}
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  kind,
  children,
}: {
  label: string;
  value: string;
  kind: "wired" | "committed" | "target";
  children?: React.ReactNode;
}) {
  return (
    <div className={`tri-fundraise-stat tri-fundraise-stat-${kind}`}>
      <span className="tri-fundraise-stat-label">{label}</span>
      <span className="tri-fundraise-stat-value">
        {value}
        {children}
      </span>
    </div>
  );
}
