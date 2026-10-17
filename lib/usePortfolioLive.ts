"use client";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { sortItems, type PortfolioItem } from "@/lib/portfolio";

// Starts from what the server sent, then keeps the portfolio live:
// a photo or video added, edited or deleted in Supabase appears for every visitor straight away.
export function usePortfolioLive(initial: PortfolioItem[]) {
  const [items, setItems] = useState<PortfolioItem[]>(initial);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let supabase: ReturnType<typeof getBrowserSupabase>;
    try { supabase = getBrowserSupabase(); } catch { return; }
    let active = true;

    // Reload everything once connected, in case the page was cached a little while ago.
    async function sync() {
      const { data, error } = await supabase.from("portfolio_items").select("*");
      if (!active || error || !data) return;
      setItems(sortItems(data as PortfolioItem[]));
    }

    const channel = supabase
      .channel("public-portfolio")
      .on("postgres_changes", { event: "*", schema: "public", table: "portfolio_items" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const row = payload.new as PortfolioItem;
          setItems((prev) => sortItems(prev.some((r) => r.id === row.id) ? prev : [...prev, row]));
        } else if (payload.eventType === "UPDATE") {
          const row = payload.new as PortfolioItem;
          setItems((prev) => sortItems(prev.map((r) => (r.id === row.id ? row : r))));
        } else if (payload.eventType === "DELETE") {
          const old = payload.old as Partial<PortfolioItem>;
          setItems((prev) => prev.filter((r) => r.id !== old.id));
        }
      })
      .subscribe((s) => {
        if (!active) return;
        if (s === "SUBSCRIBED") { setLive(true); void sync(); }
        else setLive(false);
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  return { items, live };
}