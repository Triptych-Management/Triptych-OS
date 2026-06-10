export type Status = "Todo" | "Done";

export type Page = "internal" | "management" | "marketing" | "media";

export type InternalTab = "tasks" | "fundraise" | "rolodex" | "biz-dev";

export interface User {
  id: string;
  name: string;
  initial: string;
  color: string;
  is_admin: boolean;
  created_at: string;
  archived_at: string | null;
}

export interface Task {
  id: string;
  title: string;
  owner_id: string | null;
  status: Status;
  created_at: string;
  updated_at?: string | null;
}
