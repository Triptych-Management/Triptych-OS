import type { InternalTab, Page } from "./types";

export const USER_COOKIE = "triptych-user-id";
export const USER_COOKIE_DAYS = 30;

export const PAGES: { id: Page; label: string; href: string }[] = [
  { id: "internal", label: "Internal", href: "/internal/tasks" },
  { id: "management", label: "MGMT", href: "/management" },
  { id: "marketing", label: "MRKT", href: "/marketing" },
  { id: "media", label: "MEDIA", href: "/media" },
];

export const INTERNAL_TABS: { id: InternalTab; label: string; href: string }[] = [
  { id: "tasks", label: "Tasks", href: "/internal/tasks" },
  { id: "fundraise", label: "Fundraise", href: "/internal/fundraise" },
  { id: "rolodex", label: "Rolodex", href: "/internal/rolodex" },
  { id: "biz-dev", label: "Biz Dev", href: "/internal/biz-dev" },
];

// Soft-delete undo window (ms). Matches old behavior.
export const UNDO_WINDOW_MS = 4000;

// Poll cadence (ms) when tab is visible.
export const POLL_INTERVAL_MS = 5000;

// ----- Fundraise --------------------------------------------------------

import type { InvestorStatus } from "./types";

export const INVESTOR_STATUSES: InvestorStatus[] = [
  "Conversation",
  "Interested",
  "SAFE Sent",
  "Signed",
  "On Carta",
  "Wired",
];

// Statuses that count toward "committed" (counts in the middle progress
// layer). Wired is a strict subset.
export const COMMITTED_STATUSES: InvestorStatus[] = [
  "Signed",
  "On Carta",
  "Wired",
];

export const WIRED_STATUSES: InvestorStatus[] = ["Wired"];

export interface StatusStyle {
  bg: string;
  fg: string;
}

export const INVESTOR_STATUS_STYLES: Record<InvestorStatus, StatusStyle> = {
  Conversation: { bg: "rgba(100, 100, 120, 0.10)", fg: "#64647A" },
  Interested:   { bg: "rgba(44, 59, 211, 0.10)",   fg: "#2C3BD3" },
  "SAFE Sent":  { bg: "rgba(168, 115, 8, 0.12)",   fg: "#A87308" },
  Signed:       { bg: "rgba(109, 40, 217, 0.12)",  fg: "#6D28D9" },
  "On Carta":   { bg: "rgba(3, 105, 161, 0.12)",   fg: "#0369A1" },
  Wired:        { bg: "rgba(30, 140, 78, 0.16)",   fg: "#1E8C4E" },
};
