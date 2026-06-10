import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

// GET /api/tasks                  → internal tasks (both fk's null)
// GET /api/tasks?artist_id=<uuid> → tasks for that artist
// GET /api/tasks?client_id=<uuid> → tasks for that client
// artist_id and client_id are mutually exclusive; if both are set,
// client_id wins (no use case for the inverse).
export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get("artist_id");
  const clientId = req.nextUrl.searchParams.get("client_id");

  let query = supabaseServer()
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  } else if (artistId) {
    query = query.eq("artist_id", artistId);
  } else {
    // Internal scope: both null.
    query = query.is("artist_id", null).is("client_id", null);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[api/tasks] GET error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data ?? []);
}

// POST /api/tasks — body: { title, owner_id, artist_id?, client_id? }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid JSON body", 400);
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return jsonError("title required", 400);
  }
  const owner_id =
    typeof body.owner_id === "string" && body.owner_id ? body.owner_id : null;
  const artist_id =
    typeof body.artist_id === "string" && body.artist_id ? body.artist_id : null;
  const client_id =
    typeof body.client_id === "string" && body.client_id ? body.client_id : null;

  const { data, error } = await supabaseServer()
    .from("tasks")
    .insert({
      title: body.title.trim(),
      owner_id,
      artist_id,
      client_id,
      status: "Todo",
    })
    .select()
    .single();

  if (error) {
    console.error("[api/tasks] POST error:", JSON.stringify(error));
    const detail = [error.message, error.details, error.hint, error.code]
      .filter(Boolean)
      .join(" · ");
    return jsonError(detail || "Insert failed", 500);
  }
  return NextResponse.json(data);
}
