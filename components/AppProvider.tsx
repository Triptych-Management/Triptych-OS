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
import { toast } from "@/lib/toast";
import type { User } from "@/lib/types";
import { UserManager } from "./UserManager";

interface AppCtx {
  users: User[];
  currentUser: User | null;
  setCurrentUserId: (id: string) => void;
  reloadUsers: () => Promise<void>;
  ready: boolean;
  /** Admin mode toggled via Cmd/Ctrl+Shift+A. Only available when the current
   *  user has `is_admin` true. When on, TopNav shows a "+ Add user" button. */
  adminMode: boolean;
  setAdminMode: (v: boolean) => void;
  /** Opens the user manager modal. Used by both the dropdown link and the
   *  admin-mode quick-add button. */
  openUserManager: () => void;
  closeUserManager: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [userManagerOpen, setUserManagerOpen] = useState(false);

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

  // Auto-exit admin mode if the active user is no longer an admin
  // (e.g. switched to a non-admin user while in admin mode).
  useEffect(() => {
    if (adminMode && !currentUser?.is_admin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminMode(false);
    }
  }, [adminMode, currentUser]);

  // Keyboard shortcut: Cmd/Ctrl + Shift + A toggles admin mode.
  // Esc exits admin mode (without closing the modal — modal has its own Esc).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isAdminShortcut =
        (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a";
      if (isAdminShortcut) {
        e.preventDefault();
        if (!currentUser?.is_admin) {
          toast.error("Admin mode requires an admin user");
          return;
        }
        setAdminMode((v) => {
          const next = !v;
          toast.success(next ? "Admin mode on" : "Admin mode off");
          return next;
        });
      }
      if (e.key === "Escape" && adminMode && !userManagerOpen) {
        setAdminMode(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [currentUser, adminMode, userManagerOpen]);

  const openUserManager = useCallback(() => setUserManagerOpen(true), []);
  const closeUserManager = useCallback(() => setUserManagerOpen(false), []);

  const value: AppCtx = {
    users,
    currentUser,
    setCurrentUserId,
    reloadUsers,
    ready,
    adminMode,
    setAdminMode,
    openUserManager,
    closeUserManager,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {userManagerOpen && <UserManager onClose={closeUserManager} />}
    </Ctx.Provider>
  );
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
