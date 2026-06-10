// Minimal Database type for the Supabase client. supabase-js infers `never`
// for from()/insert() unless a Database generic is provided.

import type { Task, User } from "./types";

type DbTable<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      tasks: DbTable<Task>;
      users: DbTable<User>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
