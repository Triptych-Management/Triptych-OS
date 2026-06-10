import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

// Slugify: lowercase, replace non-alphanumeric with hyphens, collapse, trim.
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

// GET /api/artists — all non-archived, ordered by position.
export async function GET() {
  const { data, error } = await supabaseServer()
    .from("artists")
    .select("*")
    .is("archived_at", null)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[api/artists] GET error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data ?? []);
}

// POST /api/artists — body: { name, slug?, position? }
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

  const name = body.name.trim();
  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : slugify(name);
  if (!slug) return jsonError("could not derive slug from name", 400);

  // Default position: end of the list.
  let position =
    typeof body.position === "number" ? body.position : undefined;
  if (position === undefined) {
    const { data: tail } = await supabaseServer()
      .from("artists")
      .select("position")
      .is("archived_at", null)
      .order("position", { ascending: false })
      .limit(1);
    position = (tail?.[0]?.position ?? 0) + 1;
  }

  const { data, error } = await supabaseServer()
    .from("artists")
    .insert({ name, slug, position, notes: "" })
    .select()
    .single();

  if (error) {
    console.error("[api/artists] POST error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}
