import { NextRequest, NextResponse } from "next/server";
import {
  FUNDRAISE_GATE_COOKIE,
  FUNDRAISE_GATE_MAX_AGE,
  fundraiseGateToken,
} from "@/lib/fundraise-gate";

export const runtime = "nodejs";

// GET — returns { authed: boolean } based on the current cookie.
// When FUNDRAISE_GATE_PASSWORD is not configured (local dev without the
// env var), the gate is open by default.
export async function GET(req: NextRequest) {
  const password = process.env.FUNDRAISE_GATE_PASSWORD;
  if (!password) return NextResponse.json({ authed: true });
  const expected = await fundraiseGateToken(password);
  const cookie = req.cookies.get(FUNDRAISE_GATE_COOKIE)?.value;
  return NextResponse.json({ authed: cookie === expected });
}

// POST — body: { password }. Sets the HttpOnly cookie on success.
export async function POST(req: NextRequest) {
  const password = process.env.FUNDRAISE_GATE_PASSWORD;
  if (!password) {
    // Dev mode: no password set, treat as already authed.
    return NextResponse.json({ ok: true });
  }
  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (typeof body.password !== "string" || body.password !== password) {
    // Don't leak which condition failed (length, equality, etc.).
    return NextResponse.json({ error: "incorrect password" }, { status: 401 });
  }
  const token = await fundraiseGateToken(password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(FUNDRAISE_GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: FUNDRAISE_GATE_MAX_AGE,
    path: "/",
  });
  return res;
}

// DELETE — clears the cookie (lock again).
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(FUNDRAISE_GATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return res;
}
