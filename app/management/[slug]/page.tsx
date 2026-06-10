"use client";

import { useParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { ArtistDetail } from "@/components/ArtistDetail";

export default function ArtistPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { artists, ready } = useApp();
  const artist = artists.find((a) => a.slug === slug);

  if (!ready) {
    return <div className="tri-empty">Loading…</div>;
  }
  if (!artist) {
    return (
      <div className="tri-empty">
        Artist not found. It may have been archived.
      </div>
    );
  }
  return <ArtistDetail artist={artist} />;
}
