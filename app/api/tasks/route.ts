import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

// GET /api/tasks               → internal tasks (artist_id IS NULL)
// GET /api/tasks?artist_id=    → internal tasks (artist_id IS NULL)
// GET /api/tasks?artist_id=<uuid> → tasks for that artist
export async function GET(req: NextRequest) {
  const artistIdParam = req.nextUrl.searchParams.get("artist_id");
  const wantInternal = artistIdParam === null || artistIdParam === "";

  let query = supabaseServer()
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (wantInternal) {
    query = query.is("artist_id", null);
  } else {
    query = query.eq("artist_id", artistIdParam as string);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/tasks] GET error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data ?? []);
}

// POST /api/tasks — body: { title, owner_id, artist_id? }
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

  const { data, error } = await supabaseServer()
    .from("tasks")
    .insert({
      title: body.title.trim(),
      owner_id,
      artist_id,
      status: "Todo",
    })
    .select()
    .single();

  if (error) {
    console.error("[api/tasks] POST error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}
