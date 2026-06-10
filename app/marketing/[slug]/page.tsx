"use client";

import { useParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { ClientDetail } from "@/components/ClientDetail";

export default function ClientPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { clients, ready } = useApp();
  const client = clients.find((c) => c.slug === slug);

  if (!ready) return <div className="tri-empty">Loading…</div>;
  if (!client) {
    return (
      <div className="tri-empty">
        Client not found. It may have been archived.
      </div>
    );
  }
  return <ClientDetail client={client} />;
}
