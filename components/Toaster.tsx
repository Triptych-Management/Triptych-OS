"use client";

import { dismiss, useToasts, type ToastItem } from "@/lib/toast";

export function Toaster() {
  const items = useToasts();
  if (items.length === 0) return null;
  return (
    <div
      aria-live="polite"
      role="status"
      className="tri-toaster"
    >
      {items.map((t) => (
        <ToastPill key={t.id} item={t} />
      ))}
    </div>
  );
}

function ToastPill({ item }: { item: ToastItem }) {
  if (item.kind === "action") {
    return <ActionToast item={item} />;
  }
  return (
    <button
      onClick={() => dismiss(item.id)}
      className={`tri-toast tri-toast-${item.kind}`}
    >
      {item.message}
    </button>
  );
}

function ActionToast({ item }: { item: ToastItem }) {
  const action = item.action;
  return (
    <div className="tri-toast tri-toast-action">
      <span className="tri-toast-msg">{item.message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            dismiss(item.id);
          }}
          className="tri-toast-action-btn"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
