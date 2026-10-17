"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client for the admin dashboard. It keeps the admin's sign-in session.
// Safe to expose: Row Level Security only lets a signed-in admin read bookings and enquiries.
let client: SupabaseClient | null = null;

// Keeps only the address part (https://xxxx.supabase.co), so a trailing slash or a pasted
// "/rest/v1" in .env can no longer cause "Invalid path specified in request URL".
const cleanUrl = (u: string) => {
  try { return new URL(u.trim()).origin; } catch { return u.trim(); }
};

export function getBrowserSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  client = createClient(cleanUrl(url), key.trim(), { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}