import { createClient } from "@supabase/supabase-js";

// Keeps only the address part (https://xxxx.supabase.co), so a trailing slash or a pasted
// "/rest/v1" in .env can no longer cause "Invalid path specified in request URL".
const cleanUrl = (u: string) => {
  try { return new URL(u.trim()).origin; } catch { return u.trim(); }
};

// Anon client: safe for public reads and booking inserts because Row Level Security guards every table.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(cleanUrl(url), key.trim(), { auth: { persistSession: false } });
}


// Client that acts as a signed-in user, using the access token the browser sends.
// Row Level Security then sees that user, so they can only ever attach their own id to a booking.
export function getSupabaseForUser(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(cleanUrl(url), key.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}