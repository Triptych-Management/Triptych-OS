"use client";

import { useState } from "react";
import { useApp } from "./AppProvider";

export function TaskInput({
  onAdd,
}: {
  onAdd: (title: string, owner_id: string | null) => void;
}) {
  const { users, currentUser } = useApp();
  const [title, setTitle] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(
    currentUser?.id ?? null
  );

  if (currentUser && ownerId === null) {
    setOwnerId(currentUser.id);
  }

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), ownerId);
    setTitle("");
  };

  return (
    <div className="tri-task-input">
      <select
        className="tri-task-input-owner"
        value={ownerId ?? ""}
        onChange={(e) => setOwnerId(e.target.value || null)}
        aria-label="Owner"
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <input
        className="tri-task-input-field"
        placeholder="Add a task and press Enter"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <button
        className="tri-btn tri-btn-primary"
        disabled={!title.trim()}
        onClick={submit}
      >
        Add
      </button>
    </div>
  );
}
