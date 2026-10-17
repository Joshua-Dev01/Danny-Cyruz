"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAdminTable } from "@/lib/useAdminTable";
import type { Booking, Enquiry } from "@/lib/useRealtimeTable";
import { PageHead, Tag, Skeleton, StatCard, Avatar, Icon, card, naira, fmtDate, fmtTime, timeAgo, btnDark, label } from "./ui";

type Item = { id: string; media_type: "photo" | "video" };
const payTone = { paid: "green", unpaid: "amber", refunded: "grey" } as const;
const statusTone = { pending: "amber", confirmed: "blue", completed: "green", cancelled: "red" } as const;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Overview() {
  const b = useAdminTable<Booking>("bookings", "created_at", false);
  const e = useAdminTable<Enquiry>("enquiries", "created_at", false);
  const p = useAdminTable<Item>("portfolio_items");
  const loading = b.loading || e.loading || p.loading;

  const s = useMemo(() => {
    const week = Date.now() - 7 * 864e5;
    const unpaid = b.rows.filter((x) => x.payment_status === "unpaid" && x.status !== "cancelled");
    return {
      pending: b.rows.filter((x) => x.status === "pending").length,
      thisWeek: b.rows.filter((x) => new Date(x.created_at).getTime() > week).length,
      unpaid: unpaid.length,
      due: unpaid.reduce((n, x) => n + x.deposit_amount, 0),
      collected: b.rows.filter((x) => x.payment_status === "paid").reduce((n, x) => n + x.deposit_amount, 0),
      newEnq: e.rows.filter((x) => x.status === "new").length,
      photos: p.rows.filter((x) => x.media_type === "photo").length,
      videos: p.rows.filter((x) => x.media_type === "video").length,
    };
  }, [b.rows, e.rows, p.rows]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const key = iso(d);
    return { key, d, today: i === 0, items: b.rows.filter((x) => x.event_date === key && x.status !== "cancelled").sort((a, c) => (a.event_time ?? "").localeCompare(c.event_time ?? "")) };
  }), [b.rows]);

  // Bookings made in each of the last 6 months.
  const months = useMemo(() => {
    const now = new Date();
    const list = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { d, n: b.rows.filter((x) => { const c = new Date(x.created_at); return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth(); }).length };
    });
    return { list, max: Math.max(1, ...list.map((m) => m.n)) };
  }, [b.rows]);

  return (
    <div className="space-y-8">
      <PageHead title="Overview" sub={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}>
        <Link href="/admin/bookings" className={btnDark}><Icon name="calendar" size={16} />All bookings</Link>
      </PageHead>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} color="indigo" icon="calendar" title="New bookings" value={s.pending} sub={`+${s.thisWeek} this week`} />
        <StatCard loading={loading} color="amber" icon="wallet" title="Unpaid deposits" value={s.unpaid} sub={`${naira(s.due)} due`} />
        <StatCard loading={loading} color="emerald" icon="mail" title="New enquiries" value={s.newEnq} sub="Waiting for a reply" />
        <StatCard loading={loading} color="rose" icon="image" title="Portfolio items" value={p.rows.length} sub={`${s.photos} photos · ${s.videos} videos`} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={`${card} p-5 lg:col-span-2`}>
          <div className="flex items-start justify-between gap-3">
            <div><p className="font-semibold text-slate-900">Bookings per month</p><p className="text-sm text-slate-500">Last 6 months</p></div>
            <div className="text-right"><p className={label}>Deposits collected</p><p className="text-xl font-bold text-emerald-600">{naira(s.collected)}</p></div>
          </div>
          <div className="mt-6 flex h-40 items-end gap-3">
            {months.list.map((m) => (
              <div key={m.d.toISOString()} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">{m.n}</span>
                <div className="flex w-full flex-1 items-end"><div style={{ height: `${Math.max(4, (m.n / months.max) * 100)}%` }} className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-400" /></div>
                <span className="text-[11px] text-slate-500">{m.d.toLocaleDateString("en-GB", { month: "short" })}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${card} p-5`}>
          <div className="mb-3 flex items-center justify-between"><p className="font-semibold text-slate-900">Recent enquiries</p><Link href="/admin/enquiries" className="text-xs font-semibold text-indigo-600 hover:underline">Inbox</Link></div>
          {loading ? <Skeleton className="h-32 w-full" /> : e.rows.length === 0 ? <p className="py-6 text-sm text-slate-500">No enquiries yet.</p> : (
            <ul className="space-y-3">
              {e.rows.slice(0, 4).map((x) => (
                <li key={x.id}>
                  <Link href="/admin/enquiries" className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-slate-50">
                    <Avatar name={x.full_name} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium text-slate-900">{x.full_name}</span>{x.status === "new" && <Tag tone="dark">New</Tag>}</span>
                      <span className="block truncate text-xs text-slate-500">{x.message}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <p className="mb-3 font-semibold text-slate-900">Upcoming sessions <span className="font-normal text-slate-500">· next 7 days</span></p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((d) => (
            <div key={d.key} className={`min-h-[7rem] rounded-xl border p-3 ${d.today ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" : "border-slate-200 bg-white"}`}>
              <p className={`flex items-center justify-between text-xs font-semibold ${d.today ? "text-indigo-100" : "text-slate-500"}`}>
                <span>{d.d.toLocaleDateString("en-GB", { weekday: "short" })} {d.d.getDate()}</span>
                {d.today && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">Today</span>}
              </p>
              <div className="mt-2 space-y-2">
                {d.items.map((x) => (
                  <Link key={x.id} href="/admin/bookings" className={`block rounded-lg p-2 text-xs ${d.today ? "bg-white/15 hover:bg-white/25" : "bg-indigo-50 text-indigo-900 hover:bg-indigo-100"}`}>
                    <span className="block truncate font-semibold">{x.full_name}</span>
                    <span className={`block truncate ${d.today ? "text-indigo-100" : "text-indigo-700/80"}`}>{fmtTime(x.event_time)} · {x.service}</span>
                  </Link>
                ))}
                {!d.items.length && !loading && <p className={`text-xs ${d.today ? "text-indigo-200" : "text-slate-400"}`}>Free</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><p className="font-semibold text-slate-900">Recent bookings</p><Link href="/admin/bookings" className="text-xs font-semibold text-indigo-600 hover:underline">View all {b.rows.length}</Link></div>
        <div className={`${card} divide-y divide-slate-100`}>
          {loading ? <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            : b.rows.length === 0 ? <p className="p-6 text-sm text-slate-500">No bookings yet.</p>
            : b.rows.slice(0, 5).map((x) => (
              <Link key={x.id} href="/admin/bookings" className={`flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 ${b.fresh.includes(x.id) ? "bg-amber-50" : ""}`}>
                <Avatar name={x.full_name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">{x.full_name}</span>
                  <span className="block truncate text-xs text-slate-500">{x.service} · {fmtDate(x.event_date)} · booked {timeAgo(x.created_at)}</span>
                </span>
                <span className="flex shrink-0 flex-wrap justify-end gap-1.5"><Tag tone={payTone[x.payment_status]}>{x.payment_status}</Tag><Tag tone={statusTone[x.status]}>{x.status}</Tag></span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}