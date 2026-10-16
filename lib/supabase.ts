import { createClient } from "@supabase/supabase-js";

// Anon client: safe for public reads and booking inserts because Row Level Security guards every table.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}
