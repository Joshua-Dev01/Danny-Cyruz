import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Uses the service role key, which skips Row Level Security.
// Never import this file from a "use client" component. The key must never start with NEXT_PUBLIC_.
const cleanUrl = (u: string) => {
  try { return new URL(u.trim()).origin; } catch { return u.trim(); }
};

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(cleanUrl(url), key.trim(), { auth: { persistSession: false, autoRefreshToken: false } });
}