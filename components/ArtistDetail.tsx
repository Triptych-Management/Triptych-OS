"use client";

import { ArtistNotes } from "./ArtistNotes";
import { TaskList } from "./TaskList";
import type { Artist } from "@/lib/types";

export function ArtistDetail({ artist }: { artist: Artist }) {
  return (
    <article className="tri-artist-detail">
      <header className="tri-artist-detail-head">
        <h1 className="tri-artist-detail-name">{artist.name}</h1>
      </header>
      <div className="tri-artist-detail-grid">
        <section className="tri-artist-detail-tasks" aria-labelledby="tasks-h">
          <h2 id="tasks-h" className="tri-section-label">
            Tasks
          </h2>
          <TaskList artistId={artist.id} />
        </section>
        <section className="tri-artist-detail-notes" aria-labelledby="notes-h">
          <h2 id="notes-h" className="tri-section-label tri-sr-only">
            Notes
          </h2>
          {/* `key` forces remount on artist switch — clean initial value. */}
          <ArtistNotes
            key={artist.id}
            artistId={artist.id}
            initial={artist.notes ?? ""}
          />
        </section>
      </div>
    </article>
  );
}
