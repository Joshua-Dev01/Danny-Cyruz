"use client";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export type Booking = {
  id: string;
  reference: string | null;
  full_name: string;
  email: string;
  phone: string;
  instagram: string | null;
  service: string;
  package_name: string | null;
  package_price: number | null;
  session_type: "studio" | "outdoor" | null;
  people: number;
  event_date: string;
  event_time: string | null;
  location: string | null;
  notes: string | null;
  deposit_amount: number;
  payment_status: "unpaid" | "paid" | "refunded";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};

export type Enquiry = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service: string | null;
  target_date: string | null;
  message: string;
  status: "new" | "replied" | "closed";
  created_at: string;
};

export type LiveStatus = "loading" | "live" | "offline" | "error";

type Row = { id: string };

// Loads a table (newest first) and keeps it in sync as rows are added, changed or removed.
// Row Level Security decides which rows come back: an admin sees all, a client sees only their own.
export function useRealtimeTable<T extends Row>(table: "bookings" | "enquiries") {
  const [rows, setRows] = useState<T[]>([]);
  const [status, setStatus] = useState<LiveStatus>("loading");
  const [error, setError] = useState("");
  // Ids of rows that arrived live, so the dashboard can highlight them.
  const [fresh, setFresh] = useState<string[]>([]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let active = true;

    async function load() {
      const { data, error: err } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (!active) return;
      if (err) { setError(err.message); setStatus("error"); return; }
      setRows((data ?? []) as T[]);
    }
    void load();

    const channel = supabase
      .channel(`admin-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        if (payload.eventType === "INSERT") {
          const row = payload.new as T;
          setRows((prev) => (prev.some((r) => r.id === row.id) ? prev : [row, ...prev]));
          setFresh((prev) => [...prev, row.id]);
        } else if (payload.eventType === "UPDATE") {
          const row = payload.new as T;
          setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        } else if (payload.eventType === "DELETE") {
          const old = payload.old as Partial<T>;
          setRows((prev) => prev.filter((r) => r.id !== old.id));
        }
      })
      .subscribe((s) => {
        if (!active) return;
        if (s === "SUBSCRIBED") { setStatus("live"); void load(); } // reload once so nothing is missed between load and subscribe
        else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("error");
        else if (s === "CLOSED") setStatus("offline");
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [table]);

  const clearFresh = () => setFresh([]);
  return { rows, status, error, fresh, clearFresh };
}