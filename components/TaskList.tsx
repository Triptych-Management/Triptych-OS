"use client";

import { useMemo, useState } from "react";
import { useTasks } from "@/lib/useTasks";
import { useApp } from "./AppProvider";
import { TaskInput } from "./TaskInput";
import { TaskRow } from "./TaskRow";

type Filter = "all" | "mine" | "done";

interface Props {
  /** Scope filters; mutually exclusive. Both null/undefined = internal. */
  artistId?: string | null;
  clientId?: string | null;
}

export function TaskList({ artistId, clientId }: Props = {}) {
  const { users, currentUser } = useApp();
  const { tasks, loading, add, toggle, updateTitle, updateOwner, remove } =
    useTasks({ artistId, clientId });
  const [filter, setFilter] = useState<Filter>("all");

  const userById = useMemo(() => {
    const m = new Map<string, (typeof users)[number]>();
    for (const u of users) m.set(u.id, u);
    return m;
  }, [users]);

  const visible = tasks.filter((t) => {
    if (filter === "mine") return t.owner_id === currentUser?.id && t.status !== "Done";
    if (filter === "done") return t.status === "Done";
    return t.status !== "Done";
  });

  const counts = {
    all: tasks.filter((t) => t.status !== "Done").length,
    mine: tasks.filter(
      (t) => t.status !== "Done" && t.owner_id === currentUser?.id
    ).length,
    done: tasks.filter((t) => t.status === "Done").length,
  };

  return (
    <div className="tri-tasklist">
      <TaskInput onAdd={add} />

      <div className="tri-filterbar" role="tablist" aria-label="Task filter">
        <FilterTab
          label="Active"
          count={counts.all}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterTab
          label="Mine"
          count={counts.mine}
          active={filter === "mine"}
          onClick={() => setFilter("mine")}
        />
        <FilterTab
          label="Done"
          count={counts.done}
          active={filter === "done"}
          onClick={() => setFilter("done")}
        />
      </div>

      {loading ? (
        <div className="tri-empty">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="tri-empty">
          {filter === "mine"
            ? "Nothing assigned to you."
            : filter === "done"
              ? "No completed tasks yet."
              : "No active tasks. Add one above."}
        </div>
      ) : (
        <ul className="tri-task-list">
          {visible.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              owner={t.owner_id ? userById.get(t.owner_id) ?? null : null}
              users={users}
              onToggle={() => toggle(t.id)}
              onUpdateTitle={(title) => updateTitle(t.id, title)}
              onUpdateOwner={(owner_id) => updateOwner(t.id, owner_id)}
              onDelete={() => remove(t.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`tri-filter${active ? " is-active" : ""}`}
      onClick={onClick}
    >
      <span className="tri-filter-label">{label}</span>
      <span className="tri-filter-count">{count}</span>
    </button>
  );
}
