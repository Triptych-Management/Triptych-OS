import type { Artist, Task, User } from "./types";

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ----- Users ---------------------------------------------------------------

export async function fetchUsers(): Promise<User[]> {
  return asJson<User[]>(await fetch("/api/users", { cache: "no-store" }));
}

export async function createUser(input: {
  name: string;
  initial: string;
  color?: string;
  is_admin?: boolean;
}): Promise<User> {
  return asJson<User>(
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "initial" | "color" | "is_admin">>
): Promise<User> {
  return asJson<User>(
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function archiveUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

// ----- Artists -------------------------------------------------------------

export async function fetchArtists(): Promise<Artist[]> {
  return asJson<Artist[]>(await fetch("/api/artists", { cache: "no-store" }));
}

export async function createArtist(input: {
  name: string;
  slug?: string;
}): Promise<Artist> {
  return asJson<Artist>(
    await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function updateArtist(
  id: string,
  patch: Partial<Pick<Artist, "name" | "slug" | "position" | "notes" | "archived_at">>
): Promise<Artist> {
  return asJson<Artist>(
    await fetch(`/api/artists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function archiveArtist(id: string): Promise<void> {
  const res = await fetch(`/api/artists/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

// ----- Tasks ---------------------------------------------------------------

/** Fetch tasks. Pass null/undefined for internal (artist_id IS NULL),
 *  or a uuid string for tasks scoped to that artist. */
export async function fetchTasks(artistId?: string | null): Promise<Task[]> {
  const url = artistId
    ? `/api/tasks?artist_id=${encodeURIComponent(artistId)}`
    : "/api/tasks";
  return asJson<Task[]>(await fetch(url, { cache: "no-store" }));
}

export async function createTask(input: {
  title: string;
  owner_id: string | null;
  artist_id?: string | null;
}): Promise<Task> {
  return asJson<Task>(
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function patchTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "status" | "owner_id">>
): Promise<Task> {
  return asJson<Task>(
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}
