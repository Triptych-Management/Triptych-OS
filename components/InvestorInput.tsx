"use client";

import { useState } from "react";
import { INVESTOR_STATUSES } from "@/lib/constants";
import type { InvestorStatus } from "@/lib/types";

export function InvestorInput({
  onAdd,
}: {
  onAdd: (input: {
    name: string;
    amount: number;
    status: InvestorStatus;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<InvestorStatus>("Conversation");

  const submit = () => {
    if (!name.trim()) return;
    const n = Number(amount);
    onAdd({
      name: name.trim(),
      amount: Number.isNaN(n) || n < 0 ? 0 : n,
      status,
    });
    setName("");
    setAmount("");
    setStatus("Conversation");
  };

  return (
    <div className="tri-investor-input">
      <input
        className="tri-investor-name-input"
        placeholder="Investor name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <input
        className="tri-investor-amount-input"
        type="number"
        min={0}
        placeholder="$0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <select
        className="tri-investor-status"
        value={status}
        onChange={(e) => setStatus(e.target.value as InvestorStatus)}
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
        className="tri-btn tri-btn-primary"
        onClick={submit}
        disabled={!name.trim()}
      >
        Add
      </button>
    </div>
  );
}
