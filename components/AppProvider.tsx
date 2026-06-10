"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchArtists,
  fetchClients,
  fetchUsers,
} from "@/lib/api-client";
import { readUserCookie, writeUserCookie } from "@/lib/cookies";
import { toast } from "@/lib/toast";
import type { Artist, Client, User } from "@/lib/types";
import { ArtistManager } from "./ArtistManager";
import { ClientManager } from "./ClientManager";
import { UserManager } from "./UserManager";

interface AppCtx {
  users: User[];
  currentUser: User | null;
  setCurrentUserId: (id: string) => void;
  reloadUsers: () => Promise<void>;

  artists: Artist[];
  reloadArtists: () => Promise<void>;
  patchArtistLocal: (id: string, patch: Partial<Artist>) => void;

  clients: Client[];
  reloadClients: () => Promise<void>;
  patchClientLocal: (id: string, patch: Partial<Client>) => void;

  ready: boolean;

  adminMode: boolean;
  setAdminMode: (v: boolean) => void;

  openUserManager: () => void;
  closeUserManager: () => void;

  openArtistManager: () => void;
  closeArtistManager: () => void;

  openClientManager: () => void;
  closeClientManager: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [userManagerOpen, setUserManagerOpen] = useState(false);
  const [artistManagerOpen, setArtistManagerOpen] = useState(false);
  const [clientManagerOpen, setClientManagerOpen] = useState(false);

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

  const reloadClients = useCallback(async () => {
    try {
      setClients(await fetchClients());
    } catch (e) {
      console.warn("[AppProvider] fetchClients failed", e);
    }
  }, []);

  const patchArtistLocal = useCallback(
    (id: string, patch: Partial<Artist>) => {
      setArtists((cur) => cur.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    []
  );

  const patchClientLocal = useCallback(
    (id: string, patch: Partial<Client>) => {
      setClients((cur) => cur.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    []
  );

  useEffect(() => {
    const cookieId = readUserCookie();
    void (async () => {
      await Promise.all([reloadUsers(), reloadArtists(), reloadClients()]);
      if (cookieId) setCurrentId(cookieId);
      setReady(true);
    })();
  }, [reloadUsers, reloadArtists, reloadClients]);

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

  useEffect(() => {
    if (adminMode && !currentUser?.is_admin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminMode(false);
    }
  }, [adminMode, currentUser]);

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
        !artistManagerOpen &&
        !clientManagerOpen
      ) {
        setAdminMode(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [
    currentUser,
    adminMode,
    userManagerOpen,
    artistManagerOpen,
    clientManagerOpen,
  ]);

  const openUserManager = useCallback(() => setUserManagerOpen(true), []);
  const closeUserManager = useCallback(() => setUserManagerOpen(false), []);
  const openArtistManager = useCallback(() => setArtistManagerOpen(true), []);
  const closeArtistManager = useCallback(() => setArtistManagerOpen(false), []);
  const openClientManager = useCallback(() => setClientManagerOpen(true), []);
  const closeClientManager = useCallback(() => setClientManagerOpen(false), []);

  const value: AppCtx = {
    users,
    currentUser,
    setCurrentUserId,
    reloadUsers,
    artists,
    reloadArtists,
    patchArtistLocal,
    clients,
    reloadClients,
    patchClientLocal,
    ready,
    adminMode,
    setAdminMode,
    openUserManager,
    closeUserManager,
    openArtistManager,
    closeArtistManager,
    openClientManager,
    closeClientManager,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {userManagerOpen && <UserManager onClose={closeUserManager} />}
      {artistManagerOpen && <ArtistManager onClose={closeArtistManager} />}
      {clientManagerOpen && <ClientManager onClose={closeClientManager} />}
    </Ctx.Provider>
  );
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
