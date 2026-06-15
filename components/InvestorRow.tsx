"use client";

import { useEffect, useRef, useState } from "react";
import { INVESTOR_STATUSES, INVESTOR_STATUS_STYLES } from "@/lib/constants";
import type { Investor, InvestorStatus } from "@/lib/types";

interface Props {
  investor: Investor;
  onUpdateName: (name: string) => void;
  onUpdateAmount: (amount: number) => void;
  onUpdateStatus: (status: InvestorStatus) => void;
  onDelete: () => void;
}

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function InvestorRow({
  investor,
  onUpdateName,
  onUpdateAmount,
  onUpdateStatus,
  onDelete,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(investor.name);
  const nameRef = useRef<HTMLInputElement>(null);

  const [editingAmount, setEditingAmount] = useState(false);
  const [amountDraft, setAmountDraft] = useState(String(investor.amount));
  const amountRef = useRef<HTMLInputElement>(null);

  // Sync local draft when the server-side value changes (e.g. via poll).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNameDraft(investor.name), [investor.name]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setAmountDraft(String(investor.amount)), [investor.amount]);
  useEffect(() => {
    if (editingName) nameRef.current?.select();
  }, [editingName]);
  useEffect(() => {
    if (editingAmount) amountRef.current?.select();
  }, [editingAmount]);

  const commitName = () => {
    setEditingName(false);
    if (nameDraft.trim() && nameDraft !== investor.name) {
      onUpdateName(nameDraft);
    } else {
      setNameDraft(investor.name);
    }
  };
  const commitAmount = () => {
    setEditingAmount(false);
    const n = Number(amountDraft);
    if (Number.isNaN(n) || n < 0) {
      setAmountDraft(String(investor.amount));
      return;
    }
    if (n !== investor.amount) onUpdateAmount(n);
  };

  const style = INVESTOR_STATUS_STYLES[investor.status];

  return (
    <li className="tri-investor-row">
      {editingName ? (
        <input
          ref={nameRef}
          className="tri-investor-name-input"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitName();
            if (e.key === "Escape") {
              setNameDraft(investor.name);
              setEditingName(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="tri-investor-name"
          onClick={() => setEditingName(true)}
          title="Click to edit"
        >
          {investor.name}
        </button>
      )}

      {editingAmount ? (
        <input
          ref={amountRef}
          className="tri-investor-amount-input"
          type="number"
          min={0}
          value={amountDraft}
          onChange={(e) => setAmountDraft(e.target.value)}
          onBlur={commitAmount}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitAmount();
            if (e.key === "Escape") {
              setAmountDraft(String(investor.amount));
              setEditingAmount(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="tri-investor-amount"
          onClick={() => setEditingAmount(true)}
          title="Click to edit"
        >
          {fmtMoney(investor.amount)}
        </button>
      )}

      <select
        className="tri-investor-status"
        value={investor.status}
        onChange={(e) => onUpdateStatus(e.target.value as InvestorStatus)}
        style={{ backgroundColor: style.bg, color: style.fg, borderColor: style.bg }}
        aria-label="Status"
      >
        {INVESTOR_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="tri-task-delete"
        onClick={onDelete}
        aria-label="Remove investor"
        title="Remove"
      >
        ×
      </button>
    </li>
  );
}
