import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function MarketingIndexPage() {
  const { data } = await supabaseServer()
    .from("clients")
    .select("slug")
    .is("archived_at", null)
    .order("position", { ascending: true })
    .limit(1);

  const first = data?.[0]?.slug;
  if (first) redirect(`/marketing/${first}`);

  return (
    <div className="tri-empty">
      No clients on the roster yet. Press <kbd>⌘⇧A</kbd> to enter admin mode,
      then add one.
    </div>
  );
}
