import { frames, videos } from "@/lib/content";

// One photo or video in the portfolio (a row of the portfolio_items table).
export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  media_type: "photo" | "video";
  cover_url: string | null; // the photo, or the video's poster image
  video_url: string | null; // a video file
  youtube_id: string | null; // or a YouTube video
  vertical: boolean;
  sort: number;
  created_at: string;
};

// Lowest sort number first, newest first when equal.
export function sortItems(items: PortfolioItem[]) {
  return [...items].sort((a, b) => a.sort - b.sort || b.created_at.localeCompare(a.created_at));
}

// Shown only if Supabase cannot be reached, so the site never has an empty portfolio by accident.
export function staticPortfolio(): PortfolioItem[] {
  const photos: PortfolioItem[] = frames.map((f, i) => ({
    id: `static-photo-${i}`, title: f.title, category: f.meta, media_type: "photo",
    cover_url: f.src, video_url: null, youtube_id: null, vertical: false, sort: i, created_at: "",
  }));
  const clips: PortfolioItem[] = (videos as { src?: string; youtube?: string; poster?: string; title: string; meta: string; vertical?: boolean }[]).map((v, i) => ({
    id: `static-video-${i}`, title: v.title, category: v.meta, media_type: "video",
    cover_url: v.poster ?? null, video_url: v.src ?? null, youtube_id: v.youtube ?? null, vertical: !!v.vertical, sort: 100 + i, created_at: "",
  }));
  return [...photos, ...clips];
}