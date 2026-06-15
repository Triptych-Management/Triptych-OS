"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchFundraiseConfig } from "@/lib/api-client";
import { COMMITTED_STATUSES, POLL_INTERVAL_MS, WIRED_STATUSES } from "@/lib/constants";
import { useInvestors } from "@/lib/useInvestors";
import type { FundraiseConfig } from "@/lib/types";
import { FundraiseProgressBar } from "./FundraiseProgressBar";
import { InvestorInput } from "./InvestorInput";
import { InvestorRow } from "./InvestorRow";

export function FundraiseDashboard() {
  const { investors, loading, add, updateName, updateAmount, updateStatus, remove } =
    useInvestors();

  const [config, setConfig] = useState<FundraiseConfig | null>(null);
  const reloadConfig = useCallback(async () => {
    try {
      setConfig(await fetchFundraiseConfig());
    } catch (e) {
      console.warn("[FundraiseDashboard] fetchFundraiseConfig failed", e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reloadConfig();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void reloadConfig();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reloadConfig]);

  const committed = investors
    .filter((i) => (COMMITTED_STATUSES as string[]).includes(i.status))
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const wired = investors
    .filter((i) => (WIRED_STATUSES as string[]).includes(i.status))
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const target = config?.target_amount ?? 0;

  return (
    <div className="tri-fundraise">
      <FundraiseProgressBar
        target={target}
        committed={committed}
        wired={wired}
        onTargetSaved={(next) =>
          setConfig((c) =>
            c ? { ...c, target_amount: next } : c
          )
        }
      />

      <section className="tri-investor-list-section" aria-label="Investors">
        <h2 className="tri-section-label">Investors</h2>
        <InvestorInput onAdd={add} />
        {loading ? (
          <div className="tri-empty">Loading…</div>
        ) : investors.length === 0 ? (
          <div className="tri-empty">No investors yet. Add the first one above.</div>
        ) : (
          <ul className="tri-investor-list">
            {investors.map((inv) => (
              <InvestorRow
                key={inv.id}
                investor={inv}
                onUpdateName={(name) => updateName(inv.id, name)}
                onUpdateAmount={(amt) => updateAmount(inv.id, amt)}
                onUpdateStatus={(status) => updateStatus(inv.id, status)}
                onDelete={() => remove(inv.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
