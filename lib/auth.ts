import type { User } from "./types";

// Names allowed to see the Fundraise tab. Compared case-insensitively
// against User.name. Update this list to grant access.
export const FUNDRAISE_AUTHORIZED_NAMES = ["Luis", "Jon"] as const;

// Fundraise is admin-only AND restricted to specific people. Both checks
// must pass — if Luis or Jon ever loses admin, access disappears too.
export function canViewFundraise(user: User | null): boolean {
  if (!user || !user.is_admin) return false;
  const n = user.name.trim().toLowerCase();
  return FUNDRAISE_AUTHORIZED_NAMES.some((allowed) => allowed.toLowerCase() === n);
}
