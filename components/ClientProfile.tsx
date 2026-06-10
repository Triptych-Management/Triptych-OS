"use client";

import { useState } from "react";
import { updateClient } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import type { Client } from "@/lib/types";
import { useApp } from "./AppProvider";

interface Props {
  client: Client;
}

// Compact client metadata card. Each field saves on blur (date / number /
// select). Optimistically updates the local cache; rolls back on failure.
export function ClientProfile({ client }: Props) {
  const { users, patchClientLocal } = useApp();

  // Cache initial values so we don't fire a save on every focus/blur.
  const [draftAm, setDraftAm] = useState<string>(client.account_manager_id ?? "");
  const [draftStart, setDraftStart] = useState<string>(
    client.campaign_start_date ?? ""
  );
  const [draftEnd, setDraftEnd] = useState<string>(client.campaign_end_date ?? "");
  const [draftPosts, setDraftPosts] = useState<string>(
    client.posts_per_invoice_period?.toString() ?? ""
  );
  const [draftInvoice, setDraftInvoice] = useState<string>(
    client.last_invoice_date ?? ""
  );

  const save = async (
    field: keyof Client,
    nextValue: string | number | null,
    rollback: () => void
  ) => {
    try {
      await updateClient(client.id, { [field]: nextValue } as Partial<Client>);
      patchClientLocal(client.id, { [field]: nextValue } as Partial<Client>);
    } catch (e) {
      rollback();
      toast.error((e as Error).message);
    }
  };

  // Helpers so we don't fire a save when the value didn't change.
  const onBlurString = (
    field: keyof Client,
    draft: string,
    initial: string | null,
    rollback: () => void
  ) => {
    if (draft === (initial ?? "")) return;
    void save(field, draft === "" ? null : draft, rollback);
  };
  const onBlurNumber = (
    field: keyof Client,
    draft: string,
    initial: number | null,
    rollback: () => void
  ) => {
    const parsed = draft === "" ? null : Number(draft);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      rollback();
      toast.error("Must be a non-negative number");
      return;
    }
    if (parsed === (initial ?? null)) return;
    void save(field, parsed, rollback);
  };

  return (
    <section className="tri-client-profile" aria-label="Client profile">
      <Field label="Account manager">
        <select
          className="tri-input tri-profile-input"
          value={draftAm}
          onChange={(e) => setDraftAm(e.target.value)}
          onBlur={() =>
            onBlurString(
              "account_manager_id",
              draftAm,
              client.account_manager_id,
              () => setDraftAm(client.account_manager_id ?? "")
            )
          }
        >
          <option value="">— Unassigned —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="tri-profile-row">
        <Field label="Campaign start">
          <input
            type="date"
            className="tri-input tri-profile-input"
            value={draftStart}
            onChange={(e) => setDraftStart(e.target.value)}
            onBlur={() =>
              onBlurString(
                "campaign_start_date",
                draftStart,
                client.campaign_start_date,
                () => setDraftStart(client.campaign_start_date ?? "")
              )
            }
          />
        </Field>
        <Field label="Campaign end">
          <input
            type="date"
            className="tri-input tri-profile-input"
            value={draftEnd}
            onChange={(e) => setDraftEnd(e.target.value)}
            onBlur={() =>
              onBlurString(
                "campaign_end_date",
                draftEnd,
                client.campaign_end_date,
                () => setDraftEnd(client.campaign_end_date ?? "")
              )
            }
          />
        </Field>
      </div>

      <div className="tri-profile-row">
        <Field label="Posts per invoice period">
          <input
            type="number"
            min={0}
            className="tri-input tri-profile-input"
            value={draftPosts}
            placeholder="—"
            onChange={(e) => setDraftPosts(e.target.value)}
            onBlur={() =>
              onBlurNumber(
                "posts_per_invoice_period",
                draftPosts,
                client.posts_per_invoice_period,
                () =>
                  setDraftPosts(
                    client.posts_per_invoice_period?.toString() ?? ""
                  )
              )
            }
          />
        </Field>
        <Field label="Last invoice received">
          <input
            type="date"
            className="tri-input tri-profile-input"
            value={draftInvoice}
            onChange={(e) => setDraftInvoice(e.target.value)}
            onBlur={() =>
              onBlurString(
                "last_invoice_date",
                draftInvoice,
                client.last_invoice_date,
                () => setDraftInvoice(client.last_invoice_date ?? "")
              )
            }
          />
        </Field>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="tri-profile-field">
      <span className="tri-profile-field-label">{label}</span>
      {children}
    </label>
  );
}
