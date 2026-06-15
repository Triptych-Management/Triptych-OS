"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  archiveInvestor as apiArchive,
  createInvestor,
  fetchInvestors,
  updateInvestor,
} from "./api-client";
import { POLL_INTERVAL_MS, UNDO_WINDOW_MS } from "./constants";
import { toast } from "./toast";
import type { Investor, InvestorStatus } from "./types";

// Same shape and patterns as useTasks: optimistic updates, 5s polling
// paused while a mutation is in flight, soft-delete with 4s undo window.
export function useInvestors() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, Investor>>(
    new Map()
  );
  const commitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const inflight = useRef(0);
  const ref = useRef<Investor[]>([]);
  useEffect(() => {
    ref.current = investors;
  }, [investors]);

  const refetch = useCallback(async () => {
    if (inflight.current > 0) return;
    try {
      const next = await fetchInvestors();
      setInvestors(next);
    } catch (e) {
      console.warn("[useInvestors] refetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

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
    async (input: { name: string; amount: number; status: InvestorStatus }) => {
      const name = input.name.trim();
      if (!name) return;
      inflight.current++;
      try {
        const created = await createInvestor({ ...input, name });
        setInvestors((prev) => [...prev, created]);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        inflight.current--;
      }
    },
    []
  );

  const updateName = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const prev = ref.current.find((i) => i.id === id);
    if (!prev || prev.name === trimmed) return;
    setInvestors((cur) =>
      cur.map((i) => (i.id === id ? { ...i, name: trimmed } : i))
    );
    inflight.current++;
    try {
      await updateInvestor(id, { name: trimmed });
    } catch (e) {
      toast.error((e as Error).message);
      setInvestors((cur) =>
        cur.map((i) => (i.id === id ? { ...i, name: prev.name } : i))
      );
    } finally {
      inflight.current--;
    }
  }, []);

  const updateAmount = useCallback(async (id: string, amount: number) => {
    if (Number.isNaN(amount) || amount < 0) return;
    const prev = ref.current.find((i) => i.id === id);
    if (!prev || prev.amount === amount) return;
    setInvestors((cur) =>
      cur.map((i) => (i.id === id ? { ...i, amount } : i))
    );
    inflight.current++;
    try {
      await updateInvestor(id, { amount });
    } catch (e) {
      toast.error((e as Error).message);
      setInvestors((cur) =>
        cur.map((i) => (i.id === id ? { ...i, amount: prev.amount } : i))
      );
    } finally {
      inflight.current--;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: InvestorStatus) => {
    const prev = ref.current.find((i) => i.id === id);
    if (!prev || prev.status === status) return;
    setInvestors((cur) =>
      cur.map((i) => (i.id === id ? { ...i, status } : i))
    );
    inflight.current++;
    try {
      await updateInvestor(id, { status });
    } catch (e) {
      toast.error((e as Error).message);
      setInvestors((cur) =>
        cur.map((i) => (i.id === id ? { ...i, status: prev.status } : i))
      );
    } finally {
      inflight.current--;
    }
  }, []);

  const remove = useCallback((id: string) => {
    const inv = ref.current.find((i) => i.id === id);
    if (!inv) return;

    setPendingDeletes((p) => {
      const next = new Map(p);
      next.set(id, inv);
      return next;
    });

    const undo = () => {
      const timer = commitTimers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        commitTimers.current.delete(id);
      }
      setPendingDeletes((p) => {
        const next = new Map(p);
        next.delete(id);
        return next;
      });
    };

    const commit = async () => {
      commitTimers.current.delete(id);
      inflight.current++;
      try {
        await apiArchive(id);
        setInvestors((cur) => cur.filter((i) => i.id !== id));
      } catch (e) {
        toast.error((e as Error).message);
        undo();
      } finally {
        inflight.current--;
      }
      setPendingDeletes((p) => {
        const next = new Map(p);
        next.delete(id);
        return next;
      });
    };

    const timer = setTimeout(() => void commit(), UNDO_WINDOW_MS);
    commitTimers.current.set(id, timer);

    toast.action(
      `Removed ${inv.name}`,
      { label: "Undo", onClick: undo },
      UNDO_WINDOW_MS
    );
  }, []);

  const visible = investors.filter((i) => !pendingDeletes.has(i.id));

  return { investors: visible, loading, add, updateName, updateAmount, updateStatus, remove };
}
