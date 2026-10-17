"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

// Loads a whole table for the admin and reloads it whenever anyone changes a row.
// `fresh` holds the ids of rows that arrived after the first load, so new bookings can be highlighted.
export function useAdminTable<T extends { id: string }>(table: string, orderCol?: string, ascending = true) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  const known = useRef<Set<string> | null>(null);

  const reload = useCallback(async () => {
    const supabase = getBrowserSupabase();
    let q = supabase.from(table).select("*");
    if (orderCol) q = q.order(orderCol, { ascending });
    const { data, error: err } = await q;
    if (err) { setError(err.message); setLoading(false); return; }
    const list = (data ?? []) as T[];
    if (known.current) {
      const added = list.filter((r) => !known.current!.has(r.id)).map((r) => r.id);
      if (added.length) {
        setFresh((p) => [...p, ...added]);
        setTimeout(() => setFresh((p) => p.filter((id) => !added.includes(id))), 8000);
      }
    }
    known.current = new Set(list.map((r) => r.id));
    setRows(list); setError(""); setLoading(false);
  }, [table, orderCol, ascending]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    void reload();
    const channel = supabase
      .channel(`admin-table-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => void reload())
      .subscribe((s) => setLive(s === "SUBSCRIBED"));
    return () => { void supabase.removeChannel(channel); };
  }, [table, reload]);

  return { rows, loading, error, live, fresh, reload };
}
