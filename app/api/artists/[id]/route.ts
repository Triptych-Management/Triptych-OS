import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const ALLOWED_FIELDS = new Set([
  "name",
  "slug",
  "position",
  "notes",
  "archived_at", // pass null to unarchive
]);

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/artists/[id]
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

  const { data, error } = await supabaseServer()
    .from("artists")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[api/artists PATCH] error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}

// DELETE /api/artists/[id] — soft-archive (sets archived_at).
export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params;
  if (!id) return jsonError("missing id", 400);

  const { error } = await supabaseServer()
    .from("artists")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[api/artists DELETE] error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json({ ok: true });
}
