import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

// Server-side redirect to the first non-archived artist by position.
// If no artists exist yet, render an empty state pointing at admin mode.
export default async function ManagementIndexPage() {
  const { data } = await supabaseServer()
    .from("artists")
    .select("slug")
    .is("archived_at", null)
    .order("position", { ascending: true })
    .limit(1);

  const first = data?.[0]?.slug;
  if (first) redirect(`/management/${first}`);

  return (
    <div className="tri-empty">
      No artists on the roster yet. Press <kbd>⌘⇧A</kbd> to enter admin mode,
      then add one.
    </div>
  );
}
