import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

// GET /api/users — all active users, oldest first.
export async function GET() {
  const { data, error } = await supabaseServer()
    .from("users")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[api/users] GET error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data ?? []);
}

// POST /api/users — body: { name, initial, color?, is_admin? }
// Admin-gated at the UI layer (no server-side check yet — single shared
// password model). Future: add an X-User-Id header check against is_admin.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid JSON body", 400);
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return jsonError("name required", 400);
  }
  if (typeof body.initial !== "string" || !body.initial.trim()) {
    return jsonError("initial required", 400);
  }

  const insert = {
    name: body.name.trim(),
    initial: body.initial.trim().slice(0, 2).toUpperCase(),
    color: typeof body.color === "string" ? body.color : "#2C3BD3",
    is_admin: body.is_admin === true,
  };

  const { data, error } = await supabaseServer()
    .from("users")
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error("[api/users] POST error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}
