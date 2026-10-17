import { getSupabase } from "@/lib/supabase";
import { sortItems, staticPortfolio, type PortfolioItem } from "@/lib/portfolio";

// Reads the portfolio on the server, so the page arrives with its photos already in it.
// An empty portfolio stays empty. Only a failure to reach Supabase falls back to the built-in photos.
export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  try {
    const { data, error } = await getSupabase().from("portfolio_items").select("*");
    if (error || !data) return staticPortfolio();
    return sortItems(data as PortfolioItem[]);
  } catch {
    return staticPortfolio();
  }
}