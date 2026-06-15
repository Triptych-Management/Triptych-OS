import type {
  Artist,
  Client,
  FundraiseConfig,
  Investor,
  InvestorStatus,
  Task,
  User,
} from "./types";

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

// ----- Clients -------------------------------------------------------------

export async function fetchClients(): Promise<Client[]> {
  return asJson<Client[]>(await fetch("/api/clients", { cache: "no-store" }));
}

export async function createClient(input: {
  name: string;
  slug?: string;
}): Promise<Client> {
  return asJson<Client>(
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function updateClient(
  id: string,
  patch: Partial<
    Pick<
      Client,
      | "name"
      | "slug"
      | "position"
      | "notes"
      | "account_manager_id"
      | "campaign_start_date"
      | "campaign_end_date"
      | "posts_per_invoice_period"
      | "last_invoice_date"
      | "archived_at"
    >
  >
): Promise<Client> {
  return asJson<Client>(
    await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function archiveClient(id: string): Promise<void> {
  const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

// ----- Tasks ---------------------------------------------------------------

/** Fetch tasks. Pass an artistId or clientId for scoped fetches, or omit
 *  both for internal tasks. artistId and clientId are mutually exclusive. */
export async function fetchTasks(
  scope: { artistId?: string | null; clientId?: string | null } = {}
): Promise<Task[]> {
  let url = "/api/tasks";
  if (scope.clientId) {
    url = `/api/tasks?client_id=${encodeURIComponent(scope.clientId)}`;
  } else if (scope.artistId) {
    url = `/api/tasks?artist_id=${encodeURIComponent(scope.artistId)}`;
  }
  return asJson<Task[]>(await fetch(url, { cache: "no-store" }));
}

export async function createTask(input: {
  title: string;
  owner_id: string | null;
  artist_id?: string | null;
  client_id?: string | null;
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

// ----- Investors / Fundraise ----------------------------------------------

export async function fetchInvestors(): Promise<Investor[]> {
  return asJson<Investor[]>(await fetch("/api/investors", { cache: "no-store" }));
}

export async function createInvestor(input: {
  name: string;
  amount?: number;
  status?: InvestorStatus;
}): Promise<Investor> {
  return asJson<Investor>(
    await fetch("/api/investors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function updateInvestor(
  id: string,
  patch: Partial<Pick<Investor, "name" | "amount" | "status" | "position">>
): Promise<Investor> {
  return asJson<Investor>(
    await fetch(`/api/investors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function archiveInvestor(id: string): Promise<void> {
  const res = await fetch(`/api/investors/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchFundraiseConfig(): Promise<FundraiseConfig> {
  return asJson<FundraiseConfig>(
    await fetch("/api/fundraise-config", { cache: "no-store" })
  );
}

export async function updateFundraiseTarget(target_amount: number): Promise<FundraiseConfig> {
  return asJson<FundraiseConfig>(
    await fetch("/api/fundraise-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_amount }),
    })
  );
}
