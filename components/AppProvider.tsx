"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchUsers } from "@/lib/api-client";
import { readUserCookie, writeUserCookie } from "@/lib/cookies";
import type { User } from "@/lib/types";

interface AppCtx {
  users: User[];
  currentUser: User | null;
  setCurrentUserId: (id: string) => void;
  reloadUsers: () => Promise<void>;
  ready: boolean;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const reloadUsers = useCallback(async () => {
    try {
      const next = await fetchUsers();
      setUsers(next);
    } catch (e) {
      console.warn("[AppProvider] fetchUsers failed", e);
    }
  }, []);

  // First mount: read cookie + hydrate users list.
  useEffect(() => {
    const cookieId = readUserCookie();
    void (async () => {
      await reloadUsers();
      if (cookieId) setCurrentId(cookieId);
      setReady(true);
    })();
  }, [reloadUsers]);

  // If cookie pointed at an archived user, clear it once users load.
  // Reconciling external state with a stored cookie is the effect's purpose;
  // the general "don't setState in an effect" guidance doesn't fit.
  useEffect(() => {
    if (!ready || !currentId) return;
    if (!users.find((u) => u.id === currentId && !u.archived_at)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentId(null);
    }
  }, [ready, currentId, users]);

  const setCurrentUserId = useCallback((id: string) => {
    setCurrentId(id);
    writeUserCookie(id);
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentId) ?? null,
    [users, currentId]
  );

  const value: AppCtx = { users, currentUser, setCurrentUserId, reloadUsers, ready };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
