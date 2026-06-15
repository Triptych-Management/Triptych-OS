// Secondary password gate, scoped to /internal/fundraise. Sits on top of
// the existing app-wide gate + the admin/name allowlist in lib/auth.ts.
// Cookie stores SHA-256(password + SALT); the password itself never leaves
// the server. Bump the SALT version to force re-auth for everyone.

export const FUNDRAISE_GATE_COOKIE = "triptych-fundraise-gate";
export const FUNDRAISE_GATE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SALT = "triptych-os-fundraise-gate-v1";

export async function fundraiseGateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
