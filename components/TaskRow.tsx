"use client";

import { useEffect, useRef, useState } from "react";
import type { Task, User } from "@/lib/types";

interface Props {
  task: Task;
  owner: User | null;
  users: User[];
  onToggle: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateOwner: (owner_id: string | null) => void;
  onDelete: () => void;
}

export function TaskRow({
  task,
  owner,
  users,
  onToggle,
  onUpdateTitle,
  onUpdateOwner,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== task.title) onUpdateTitle(draft);
    else setDraft(task.title);
  };

  const isDone = task.status === "Done";

  return (
    <li className={`tri-task-row${isDone ? " is-done" : ""}`}>
      <button
        className="tri-task-check"
        onClick={onToggle}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
        aria-pressed={isDone}
      >
        <span className="tri-task-check-box">
          {isDone && <span className="tri-task-check-tick">✓</span>}
        </span>
      </button>

      <select
        className="tri-task-owner"
        value={task.owner_id ?? ""}
        onChange={(e) => onUpdateOwner(e.target.value || null)}
        aria-label="Owner"
        title={owner?.name ?? "Unassigned"}
        style={
          owner
            ? { color: "#fff", backgroundColor: owner.color }
            : undefined
        }
      >
        <option value="">—</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.initial} · {u.name}
          </option>
        ))}
      </select>

      {editing ? (
        <input
          ref={inputRef}
          className="tri-task-title-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(task.title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          className="tri-task-title"
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {task.title}
        </button>
      )}

      <button
        className="tri-task-delete"
        onClick={onDelete}
        aria-label="Delete task"
        title="Delete"
      >
        ×
      </button>
    </li>
  );
}
