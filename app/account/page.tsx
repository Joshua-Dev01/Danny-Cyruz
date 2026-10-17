"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useRealtimeTable, type Booking } from "@/lib/useRealtimeTable";
import { site } from "@/lib/content";

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";
const money = (n: number) => `₦${n.toLocaleString()}`;

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function prettyTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// What the client sees, in plain words.
function statusText(b: Booking) {
  if (b.status === "cancelled") return "Cancelled";
  if (b.status === "completed") return "Completed";
  if (b.status === "confirmed") return "Confirmed";
  return b.payment_status === "paid" ? "Awaiting confirmation" : "Awaiting deposit";
}
function paymentText(b: Booking) {
  if (b.payment_status === "paid") return "Deposit paid";
  if (b.payment_status === "refunded") return "Deposit refunded";
  return `Deposit due: ${money(b.deposit_amount)}`;
}

function BookingCard({ b }: { b: Booking }) {
  const isEvent = b.service === "Events";
  const balance = b.package_price != null ? Math.max(b.package_price - b.deposit_amount, 0) : null;
  const help = encodeURIComponent(`Hello Danny, I have a question about my booking ${b.reference ?? ""}.`);
  return (
    <article className="border border-ink/10 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={label}>{b.reference ?? "Booking"}</p>
          <h2 className="mt-2 text-sm font-medium uppercase tracking-wide">{isEvent ? "Event coverage" : b.service}</h2>
          {!isEvent && b.package_name && <p className="mt-1 text-xs text-stone-600">{b.package_name}</p>}
        </div>
        <span className="bg-ink px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white">{statusText(b)}</span>
      </div>
      <dl className="mt-4 divide-y divide-ink/10 text-sm">
        <div className="flex justify-between gap-4 py-2"><dt className={label}>Date</dt><dd className="text-right">{prettyDate(b.event_date)}</dd></div>
        {b.event_time && <div className="flex justify-between gap-4 py-2"><dt className={label}>Start time</dt><dd>{prettyTime(b.event_time)}</dd></div>}
        {b.location && <div className="flex justify-between gap-4 py-2"><dt className={label}>Location</dt><dd className="text-right">{b.location}</dd></div>}
        <div className="flex justify-between gap-4 py-2"><dt className={label}>Payment</dt><dd>{paymentText(b)}</dd></div>
        <div className="flex justify-between gap-4 py-2">
          <dt className={label}>Balance on the day</dt>
          <dd>{isEvent ? "After your quote" : balance != null ? money(balance) : "—"}</dd>
        </div>
      </dl>
      <a href={`${site.whatsapp}?text=${help}`} className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] underline underline-offset-4">Questions? Chat on WhatsApp</a>
    </article>
  );
}

function MyBookings() {
  const { rows, status, error } = useRealtimeTable<Booking>("bookings");
  if (status === "error") return <p role="alert" className="text-sm text-red-700">Could not load your bookings. {error}</p>;
  if (status === "loading" && rows.length === 0) return <p className={label}>Loading your bookings…</p>;
  if (rows.length === 0) {
    return (
      <div className="border border-ink/10 p-8">
        <p className="text-sm">No bookings on this account yet.</p>
        <p className="mt-2 max-w-md text-xs text-stone-600">Bookings made before you signed in, or as a guest, will not appear here. Book while signed in and it will show up straight away.</p>
        <Link href="/book" className="btn-dark mt-6">Book a session</Link>
      </div>
    );
  }
  return <div className="grid gap-4 md:grid-cols-2">{rows.map((b) => <BookingCard key={b.id} b={b} />)}</div>;
}

export default function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabase();
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    setError("");
    const { error: err } = await getBrowserSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (err) setError("Could not start Google sign-in. Please try again.");
  }

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
  }

  const name = String(session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? "");

  return (
    <>
      <Navbar />
      <main>
        <header className="mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-10 md:pb-12 md:pt-36">
          <p className={label}>Account</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="display animate-rise text-[3rem] uppercase leading-none md:text-[6rem]">{session ? "My bookings." : "Sign in."}</h1>
            {session && (
              <div className="md:text-right">
                <p className="text-sm">{name || session.user.email}</p>
                {name && <p className="text-xs text-stone-600">{session.user.email}</p>}
                <button type="button" onClick={signOut} className="mt-2 text-[11px] uppercase tracking-[0.16em] underline underline-offset-4">Sign out</button>
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
          {!ready ? (
            <p className={label}>Loading…</p>
          ) : session ? (
            <MyBookings />
          ) : (
            <div className="max-w-md border border-ink/10 p-6 md:p-10">
              <p className="text-sm text-stone-600">Sign in to see your bookings and their status. You can still book without an account.</p>
              <button type="button" onClick={signInWithGoogle} className="btn-dark mt-8 w-full">Continue with Google</button>
              {error && <p role="alert" className="mt-4 text-xs text-red-700">{error}</p>}
              <Link href="/book" className="mt-6 inline-block text-[11px] uppercase tracking-[0.16em] underline underline-offset-4">Book as a guest</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}