"use client";

import { updateClient } from "@/lib/api-client";
import type { Client } from "@/lib/types";
import { useApp } from "./AppProvider";
import { ClientProfile } from "./ClientProfile";
import { EntityNotes } from "./EntityNotes";
import { TaskList } from "./TaskList";

export function ClientDetail({ client }: { client: Client }) {
  const { patchClientLocal } = useApp();

  return (
    <article className="tri-artist-detail">
      <header className="tri-artist-detail-head">
        <h1 className="tri-artist-detail-name">{client.name}</h1>
      </header>
      <div className="tri-artist-detail-grid">
        <section className="tri-artist-detail-tasks" aria-labelledby="tasks-h">
          <h2 id="tasks-h" className="tri-section-label">
            Tasks
          </h2>
          <TaskList clientId={client.id} />
        </section>

        <section
          className="tri-artist-detail-notes"
          aria-labelledby="profile-h"
        >
          <h2 id="profile-h" className="tri-section-label">
            Client profile
          </h2>
          <ClientProfile client={client} />

          <EntityNotes
            key={client.id}
            entityId={client.id}
            initial={client.notes ?? ""}
            onSave={async (next) => {
              await updateClient(client.id, { notes: next });
              patchClientLocal(client.id, { notes: next });
            }}
          />
        </section>
      </div>
    </article>
  );
}
