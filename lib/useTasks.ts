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

// Single-list task state. Add, toggle, edit, soft-delete-with-undo. Polls
// every 5s when the tab is visible and no mutation is in flight.
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Soft-delete bookkeeping — preserves the "undo within 4s" behavior.
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, Task>>(new Map());
  const commitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inflight = useRef(0);

  const refetch = useCallback(async () => {
    if (inflight.current > 0) return;
    try {
      const next = await fetchTasks();
      setTasks(next);
    } catch (e) {
      // Silent on poll errors — surface only on user-driven failures.
      console.warn("[useTasks] refetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling. The lint rule fires because refetch() ultimately
  // setState's — but fetch-on-mount is the whole point.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refetch();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refetch]);

  const add = useCallback(async (title: string, owner_id: string | null) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    inflight.current++;
    try {
      const created = await createTask({ title: trimmed, owner_id });
      setTasks((prev) => [created, ...prev]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      inflight.current--;
    }
  }, []);

  const toggle = useCallback(async (id: string) => {
    let prev: Task | undefined;
    setTasks((cur) => {
      const next = cur.map<Task>((t) => {
        if (t.id !== id) return t;
        prev = t;
        const nextStatus: Task["status"] = t.status === "Done" ? "Todo" : "Done";
        return { ...t, status: nextStatus };
      });
      return next;
    });
    if (!prev) return;
    const nextStatus = prev.status === "Done" ? "Todo" : "Done";
    inflight.current++;
    try {
      await patchTask(id, { status: nextStatus });
    } catch (e) {
      toast.error((e as Error).message);
      setTasks((cur) =>
        cur.map((t) => (t.id === id && prev ? { ...t, status: prev.status } : t))
      );
    } finally {
      inflight.current--;
    }
  }, []);

  const updateTitle = useCallback(async (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    let prevTitle: string | undefined;
    setTasks((cur) =>
      cur.map((t) => {
        if (t.id !== id) return t;
        prevTitle = t.title;
        return { ...t, title: trimmed };
      })
    );
    inflight.current++;
    try {
      await patchTask(id, { title: trimmed });
    } catch (e) {
      toast.error((e as Error).message);
      if (prevTitle !== undefined) {
        setTasks((cur) =>
          cur.map((t) => (t.id === id ? { ...t, title: prevTitle! } : t))
        );
      }
    } finally {
      inflight.current--;
    }
  }, []);

  const updateOwner = useCallback(async (id: string, owner_id: string | null) => {
    let prev: string | null | undefined;
    setTasks((cur) =>
      cur.map((t) => {
        if (t.id !== id) return t;
        prev = t.owner_id;
        return { ...t, owner_id };
      })
    );
    inflight.current++;
    try {
      await patchTask(id, { owner_id });
    } catch (e) {
      toast.error((e as Error).message);
      if (prev !== undefined) {
        setTasks((cur) =>
          cur.map((t) => (t.id === id ? { ...t, owner_id: prev as string | null } : t))
        );
      }
    } finally {
      inflight.current--;
    }
  }, []);

  // Soft-delete with undo:
  // 1. Stash task in pendingDeletes (hides it from UI)
  // 2. Schedule a 4s commit timer
  // 3. Show toast with UNDO action that cancels the timer and restores
  const remove = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
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
          // Restore so the user sees the failure.
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
    },
    [tasks]
  );

  // Visible = tasks - pendingDeletes.
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
