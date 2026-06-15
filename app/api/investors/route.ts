import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-helpers";
import { INVESTOR_STATUSES } from "@/lib/constants";
import { supabaseServer } from "@/lib/supabase-server";
import type { InvestorStatus } from "@/lib/types";

export const runtime = "nodejs";

function isStatus(v: unknown): v is InvestorStatus {
  return typeof v === "string" && (INVESTOR_STATUSES as string[]).includes(v);
}

// GET /api/investors — all non-archived, oldest first by position then created_at.
export async function GET() {
  const { data, error } = await supabaseServer()
    .from("investors")
    .select("*")
    .is("archived_at", null)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[api/investors] GET error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data ?? []);
}

// POST /api/investors — body: { name, amount?, status? }
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
  const amount =
    typeof body.amount === "number"
      ? body.amount
      : typeof body.amount === "string" && body.amount.trim() !== ""
        ? Number(body.amount)
        : 0;
  if (Number.isNaN(amount) || amount < 0) {
    return jsonError("amount must be a non-negative number", 400);
  }
  const status = isStatus(body.status) ? body.status : "Conversation";

  // Append at end of position order.
  const { data: tail } = await supabaseServer()
    .from("investors")
    .select("position")
    .is("archived_at", null)
    .order("position", { ascending: false })
    .limit(1);
  const position = (tail?.[0]?.position ?? 0) + 1;

  const { data, error } = await supabaseServer()
    .from("investors")
    .insert({ name: body.name.trim(), amount, status, position })
    .select()
    .single();
  if (error) {
    console.error("[api/investors] POST error:", error);
    return jsonError(error.message, 500);
  }
  return NextResponse.json(data);
}
