"use client";

import { updateArtist } from "@/lib/api-client";
import type { Artist } from "@/lib/types";
import { useApp } from "./AppProvider";
import { EntityNotes } from "./EntityNotes";
import { TaskList } from "./TaskList";

export function ArtistDetail({ artist }: { artist: Artist }) {
  const { patchArtistLocal } = useApp();

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
          <EntityNotes
            key={artist.id}
            entityId={artist.id}
            initial={artist.notes ?? ""}
            onSave={async (next) => {
              await updateArtist(artist.id, { notes: next });
              patchArtistLocal(artist.id, { notes: next });
            }}
          />
        </section>
      </div>
    </article>
  );
}
