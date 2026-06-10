import type { Task, User } from "./types";

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

// ----- Tasks ---------------------------------------------------------------

export async function fetchTasks(): Promise<Task[]> {
  return asJson<Task[]>(await fetch("/api/tasks", { cache: "no-store" }));
}

export async function createTask(input: {
  title: string;
  owner_id: string | null;
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
