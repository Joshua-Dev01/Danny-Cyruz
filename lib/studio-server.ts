import { getSupabase } from "@/lib/supabase";

export type StudioPhoto = { id: string; caption: string; image_url: string; sort: number; created_at: string };

// Reads the studio photos on the server. Returns [] if the table is empty or not set up yet,
// and the Studio page then shows its built-in photos instead.
export async function fetchStudioPhotos(): Promise<StudioPhoto[]> {
  try {
    const { data, error } = await getSupabase().from("studio_photos").select("*");
    if (error || !data) return [];
    return (data as StudioPhoto[]).sort((a, b) => a.sort - b.sort || b.created_at.localeCompare(a.created_at));
  } catch {
    return [];
  }
}