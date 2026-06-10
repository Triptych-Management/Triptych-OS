"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTask,
  deleteTask as apiDeleteTask,
  fetchTasks,
  patchTask,
} from "./api-client";
import { POLL_INTERVAL_MS, UNDO_WINDOW_MS } from "./constants";
import { toast } from "./toast";
import type { Task } from "./types";

interface UseTasksOptions {
  /** Mutually exclusive scope filters. Both null/undefined = internal tasks. */
  artistId?: string | null;
  clientId?: string | null;
}

export function useTasks({ artistId, clientId }: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [pendingDeletes, setPendingDeletes] = useState<Map<string, Task>>(new Map());
  const commitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inflight = useRef(0);

  // tasksRef mirrors the latest committed tasks. Mutations read `prev` from
  // this ref *before* dispatching setTasks — relying on the setState updater
  // to set a closure variable doesn't work because React queues updaters and
  // they don't run synchronously. Symptom of the old pattern: PATCH never
  // fires (task does the optimistic-disappear-then-reappear-on-poll dance).
  const tasksRef = useRef<Task[]>([]);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const aKey = artistId ?? null;
  const cKey = clientId ?? null;

  const refetch = useCallback(async () => {
    if (inflight.current > 0) return;
    try {
      const next = await fetchTasks({ artistId: aKey, clientId: cKey });
      setTasks(next);
    } catch (e) {
      console.warn("[useTasks] refetch failed", e);
    } finally {
      setLoading(false);
    }
  }, [aKey, cKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    void refetch();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refetch();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refetch]);

  const add = useCallback(
    async (title: string, owner_id: string | null) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      inflight.current++;
      try {
        const created = await createTask({
          title: trimmed,
          owner_id,
          artist_id: aKey,
          client_id: cKey,
        });
        setTasks((prev) => [created, ...prev]);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        inflight.current--;
      }
    },
    [aKey, cKey]
  );

  const toggle = useCallback(async (id: string) => {
    const prev = tasksRef.current.find((t) => t.id === id);
    if (!prev) return;
    const nextStatus: Task["status"] = prev.status === "Done" ? "Todo" : "Done";

    // Optimistic.
    setTasks((cur) =>
      cur.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    inflight.current++;
    try {
      await patchTask(id, { status: nextStatus });
    } catch (e) {
      toast.error((e as Error).message);
      setTasks((cur) =>
        cur.map((t) => (t.id === id ? { ...t, status: prev.status } : t))
      );
    } finally {
      inflight.current--;
    }
  }, []);

  const updateTitle = useCallback(async (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const prev = tasksRef.current.find((t) => t.id === id);
    if (!prev) return;
    if (prev.title === trimmed) return;

    setTasks((cur) =>
      cur.map((t) => (t.id === id ? { ...t, title: trimmed } : t))
    );

    inflight.current++;
    try {
      await patchTask(id, { title: trimmed });
    } catch (e) {
      toast.error((e as Error).message);
      setTasks((cur) =>
        cur.map((t) => (t.id === id ? { ...t, title: prev.title } : t))
      );
    } finally {
      inflight.current--;
    }
  }, []);

  const updateOwner = useCallback(async (id: string, owner_id: string | null) => {
    const prev = tasksRef.current.find((t) => t.id === id);
    if (!prev) return;
    if (prev.owner_id === owner_id) return;

    setTasks((cur) =>
      cur.map((t) => (t.id === id ? { ...t, owner_id } : t))
    );

    inflight.current++;
    try {
      await patchTask(id, { owner_id });
    } catch (e) {
      toast.error((e as Error).message);
      setTasks((cur) =>
        cur.map((t) => (t.id === id ? { ...t, owner_id: prev.owner_id } : t))
      );
    } finally {
      inflight.current--;
    }
  }, []);

  const remove = useCallback((id: string) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (!task) return;

    setPendingDeletes((prev) => {
      const next = new Map(prev);
      next.set(id, task);
      return next;
    });

    const undo = () => {
      const timer = commitTimers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        commitTimers.current.delete(id);
      }
      setPendingDeletes((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    };

    const commit = async () => {
      commitTimers.current.delete(id);
      inflight.current++;
      try {
        await apiDeleteTask(id);
        setTasks((cur) => cur.filter((t) => t.id !== id));
      } catch (e) {
        toast.error((e as Error).message);
        undo();
      } finally {
        inflight.current--;
      }
      setPendingDeletes((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    };

    const timer = setTimeout(() => void commit(), UNDO_WINDOW_MS);
    commitTimers.current.set(id, timer);

    toast.action(
      "Task deleted",
      { label: "Undo", onClick: undo },
      UNDO_WINDOW_MS
    );
  }, []);

  const visible = tasks.filter((t) => !pendingDeletes.has(t.id));

  return {
    tasks: visible,
    loading,
    add,
    toggle,
    updateTitle,
    updateOwner,
    remove,
    refetch,
  };
}
