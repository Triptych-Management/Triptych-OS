import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { INVESTOR_STATUSES } from "@/lib/constants";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const ALLOWED_FIELDS = new Set([
  "name",
  "amount",
  "status",
  "position",
  "archived_at",
]);

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params;
  if (!id) return jsonError("missing id", 400);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid JSON body", 400);
  }

  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(k)) patch[k] = v;
  }
  if (Object.keys(patch).length === 0) {
    return jsonError("no updatable fields in body", 400);
  }

  if ("status" in patch && !(INVESTOR_STATUSES as string[]).includes(patch.status as string)) {
    return jsonError("invalid status", 400);
  }
  if ("amount" in patch) {
    const n = Number(patch.amount);
    if (Number.isNaN(n) || n < 0) {
      return jsonError("amount must be a non-negative number", 400);
    }
    patch.amount = n;
  }
  if ("name" in patch && typeof patch.name === "string") {
    patch.name = (patch.name as string).trim();
    if (!patch.name) return jsonError("name cannot be empty", 400);
  }

  const { data, error } = await supabaseServer()
    .from("investors")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[api/investors PATCH] error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}

// DELETE /api/investors/[id] — soft-archive.
export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params;
  if (!id) return jsonError("missing id", 400);

  const { error } = await supabaseServer()
    .from("investors")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[api/investors DELETE] error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json({ ok: true });
}
