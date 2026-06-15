import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

// GET /api/fundraise-config — returns the singleton (id=1).
export async function GET() {
  const { data, error } = await supabaseServer()
    .from("fundraise_config")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) {
    console.error("[api/fundraise-config] GET error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}

// PATCH /api/fundraise-config — body: { target_amount }
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid JSON body", 400);
  }
  const target = Number(body.target_amount);
  if (Number.isNaN(target) || target < 0) {
    return jsonError("target_amount must be a non-negative number", 400);
  }
  const { data, error } = await supabaseServer()
    .from("fundraise_config")
    .update({ target_amount: target, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error) {
    console.error("[api/fundraise-config PATCH] error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}
