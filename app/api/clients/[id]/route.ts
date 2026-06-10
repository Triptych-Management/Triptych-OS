import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const ALLOWED_FIELDS = new Set([
  "name",
  "slug",
  "position",
  "notes",
  "account_manager_id",
  "campaign_start_date",
  "campaign_end_date",
  "posts_per_invoice_period",
  "last_invoice_date",
  "archived_at",
]);

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/clients/[id]
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
    if (ALLOWED_FIELDS.has(k)) {
      // Coerce empty strings on optional fields to null so the DB stores NULL,
      // not "". Date and number inputs in HTML send empty strings when cleared.
      if (v === "" && k !== "name" && k !== "slug" && k !== "notes") {
        patch[k] = null;
      } else {
        patch[k] = v;
      }
    }
  }
  if (Object.keys(patch).length === 0) {
    return jsonError("no updatable fields in body", 400);
  }

  const { data, error } = await supabaseServer()
    .from("clients")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[api/clients PATCH] error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}

// DELETE /api/clients/[id] — soft-archive.
export async function DELETE(_req: NextRequest, ctx: Params) {
  const { id } = await ctx.params;
  if (!id) return jsonError("missing id", 400);

  const { error } = await supabaseServer()
    .from("clients")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[api/clients DELETE] error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json({ ok: true });
}
