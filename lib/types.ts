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

export interface Artist {
  id: string;
  name: string;
  slug: string;
  position: number;
  notes: string;
  created_at: string;
  archived_at: string | null;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  position: number;
  notes: string;
  account_manager_id: string | null;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
  posts_per_invoice_period: number | null;
  last_invoice_date: string | null;
  created_at: string;
  archived_at: string | null;
}

export interface Task {
  id: string;
  title: string;
  owner_id: string | null;
  artist_id: string | null;
  client_id: string | null;
  status: Status;
  created_at: string;
  updated_at?: string | null;
}

export type InvestorStatus =
  | "Conversation"
  | "Interested"
  | "SAFE Sent"
  | "Signed"
  | "On Carta"
  | "Wired";

export interface Investor {
  id: string;
  name: string;
  amount: number;
  status: InvestorStatus;
  position: number;
  created_at: string;
  archived_at: string | null;
}

export interface FundraiseConfig {
  id: number;
  target_amount: number;
  updated_at: string;
}
