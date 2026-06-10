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
