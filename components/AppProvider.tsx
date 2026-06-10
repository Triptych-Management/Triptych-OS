"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchArtists, fetchUsers } from "@/lib/api-client";
import { readUserCookie, writeUserCookie } from "@/lib/cookies";
import { toast } from "@/lib/toast";
import type { Artist, User } from "@/lib/types";
import { ArtistManager } from "./ArtistManager";
import { UserManager } from "./UserManager";

interface AppCtx {
  users: User[];
  currentUser: User | null;
  setCurrentUserId: (id: string) => void;
  reloadUsers: () => Promise<void>;

  artists: Artist[];
  reloadArtists: () => Promise<void>;
  /** Optimistically replace one artist in the cached list. Used by the
   *  notes editor so it doesn't have to round-trip a full re-fetch. */
  patchArtistLocal: (id: string, patch: Partial<Artist>) => void;

  ready: boolean;

  /** Admin mode toggled via Cmd/Ctrl+Shift+A. Only available when the current
   *  user has is_admin true. When on, the topnav exposes user-admin controls
   *  and the management sub-nav exposes artist-admin controls. */
  adminMode: boolean;
  setAdminMode: (v: boolean) => void;

  openUserManager: () => void;
  closeUserManager: () => void;

  openArtistManager: () => void;
  closeArtistManager: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [userManagerOpen, setUserManagerOpen] = useState(false);
  const [artistManagerOpen, setArtistManagerOpen] = useState(false);

  const reloadUsers = useCallback(async () => {
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      console.warn("[AppProvider] fetchUsers failed", e);
    }
  }, []);

  const reloadArtists = useCallback(async () => {
    try {
      setArtists(await fetchArtists());
    } catch (e) {
      console.warn("[AppProvider] fetchArtists failed", e);
    }
  }, []);

  const patchArtistLocal = useCallback(
    (id: string, patch: Partial<Artist>) => {
      setArtists((cur) => cur.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    []
  );

  // First mount: hydrate users + artists + cookie.
  useEffect(() => {
    const cookieId = readUserCookie();
    void (async () => {
      await Promise.all([reloadUsers(), reloadArtists()]);
      if (cookieId) setCurrentId(cookieId);
      setReady(true);
    })();
  }, [reloadUsers, reloadArtists]);

  // Clear cookie if it points at an archived user.
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

  // Auto-exit admin mode if active user loses admin.
  useEffect(() => {
    if (adminMode && !currentUser?.is_admin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminMode(false);
    }
  }, [adminMode, currentUser]);

  // Keyboard shortcut: Cmd/Ctrl + Shift + A toggles admin mode.
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
      if (
        e.key === "Escape" &&
        adminMode &&
        !userManagerOpen &&
        !artistManagerOpen
      ) {
        setAdminMode(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [currentUser, adminMode, userManagerOpen, artistManagerOpen]);

  const openUserManager = useCallback(() => setUserManagerOpen(true), []);
  const closeUserManager = useCallback(() => setUserManagerOpen(false), []);
  const openArtistManager = useCallback(() => setArtistManagerOpen(true), []);
  const closeArtistManager = useCallback(() => setArtistManagerOpen(false), []);

  const value: AppCtx = {
    users,
    currentUser,
    setCurrentUserId,
    reloadUsers,
    artists,
    reloadArtists,
    patchArtistLocal,
    ready,
    adminMode,
    setAdminMode,
    openUserManager,
    closeUserManager,
    openArtistManager,
    closeArtistManager,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {userManagerOpen && <UserManager onClose={closeUserManager} />}
      {artistManagerOpen && <ArtistManager onClose={closeArtistManager} />}
    </Ctx.Provider>
  );
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
