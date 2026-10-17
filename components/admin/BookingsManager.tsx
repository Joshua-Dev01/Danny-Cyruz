"use client";
import { useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import type { Booking } from "@/lib/useRealtimeTable";
import { waLink, downloadCsv } from "@/lib/admin-utils";
import { PageHead, Tag, Drawer, ConfirmDialog, Empty, Skeleton, Avatar, Icon, RowMenu, StatCard, useToast, field, label, btn, btnDark, btnDanger, card, tableWrap, th, td, trow, naira, fmtDate, fmtTime } from "./ui";

const payTone = { paid: "green", unpaid: "amber", refunded: "grey" } as const;
const statusTone = { pending: "amber", confirmed: "blue", completed: "green", cancelled: "red" } as const;
const PAGE = 15;

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="pt-0.5 text-sm text-slate-500">{k}</span>
      <span className="max-w-[16rem] break-words text-right text-sm font-medium text-slate-900">{v || "—"}</span>
    </div>
  );
}

export default function BookingsManager() {
  const { rows, loading, error, fresh, reload } = useAdminTable<Booking>("bookings", "created_at", false);
  const [toast, notify] = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [pay, setPay] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((b) =>
      (status === "all" || b.status === status) &&
      (pay === "all" || b.payment_status === pay) &&
      (!s || [b.full_name, b.email, b.phone, b.reference, b.service, b.package_name].some((v) => (v ?? "").toLowerCase().includes(s))));
  }, [rows, q, status, pay]);

  const open = rows.find((b) => b.id === openId) ?? null;
  const toDelete = rows.find((b) => b.id === delId) ?? null;
  const count = (f: (b: Booking) => boolean) => rows.filter(f).length;

  async function patch(b: Booking, changes: Partial<Booking>, done: string) {
    setBusy(true);
    const { error: err } = await getBrowserSupabase().from("bookings").update(changes).eq("id", b.id);
    setBusy(false);
    if (err) return notify(err.message, true);
    notify(done); await reload();
  }

  async function remove(b: Booking) {
    setDelId(null); setBusy(true);
    const { error: err } = await getBrowserSupabase().from("bookings").delete().eq("id", b.id);
    setBusy(false);
    if (err) return notify(err.message, true);
    setOpenId(null); notify("Booking deleted."); await reload();
  }

  const exportCsv = () => downloadCsv("bookings.csv", filtered.map((b) => ({
    reference: b.reference, name: b.full_name, email: b.email, phone: b.phone, instagram: b.instagram, service: b.service,
    package: b.package_name, package_price: b.package_price, session_type: b.session_type, people: b.people, date: b.event_date,
    time: b.event_time, location: b.location, notes: b.notes, deposit: b.deposit_amount, payment: b.payment_status, status: b.status, booked_on: b.created_at,
  })));

  const balance = open?.package_price != null ? Math.max(0, open.package_price - (open.payment_status === "paid" ? open.deposit_amount : 0)) : null;
  const menuFor = (b: Booking) => [
    { label: "View details", icon: "eye", onClick: () => setOpenId(b.id) },
    { label: "Confirm booking", icon: "check", hidden: b.status !== "pending", onClick: () => patch(b, { status: "confirmed" }, "Booking confirmed.") },
    { label: "Mark deposit paid", icon: "wallet", hidden: b.payment_status === "paid", onClick: () => patch(b, { payment_status: "paid" }, "Deposit marked as paid.") },
    { label: "Mark as completed", icon: "check", hidden: b.status !== "confirmed", onClick: () => patch(b, { status: "completed" }, "Marked as completed.") },
    { label: "Message on WhatsApp", icon: "phone", href: waLink(b.phone, `Hello ${b.full_name.split(" ")[0]}, this is Danny Cyruz Photography about your booking ${b.reference ?? ""}.`) },
    { label: "Cancel booking", icon: "x", danger: true, hidden: b.status === "cancelled" || b.status === "completed", onClick: () => patch(b, { status: "cancelled" }, "Booking cancelled.") },
    { label: "Delete", icon: "trash", danger: true, onClick: () => setDelId(b.id) },
  ];

  return (
    <div className="space-y-6">
      <PageHead title="Bookings" sub="Everyone who has booked, with their payment status">
        <button onClick={exportCsv} className={btn} disabled={!filtered.length}><Icon name="download" size={16} />Export CSV</button>
      </PageHead>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} color="indigo" icon="calendar" title="Total bookings" value={rows.length} sub="All time" />
        <StatCard loading={loading} color="amber" icon="check" title="Unconfirmed" value={count((b) => b.status === "pending")} sub="Need a decision" />
        <StatCard loading={loading} color="sky" icon="wallet" title="Unpaid deposits" value={count((b) => b.payment_status === "unpaid" && b.status !== "cancelled")} sub="Waiting for payment" />
        <StatCard loading={loading} color="emerald" icon="star" title="Completed" value={count((b) => b.status === "completed")} sub="Sessions done" />
      </div>

      <div className={`${card} grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]`}>
        <div className="relative">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={field + " !mt-0 pl-9"} placeholder="Search name, email, phone, reference or service" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} />
        </div>
        <select className={field + " !mt-0"} value={status} onChange={(e) => { setStatus(e.target.value); setShown(PAGE); }} aria-label="Booking status">
          <option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
        <select className={field + " !mt-0"} value={pay} onChange={(e) => { setPay(e.target.value); setShown(PAGE); }} aria-label="Deposit status">
          <option value="all">All deposits</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="refunded">Refunded</option>
        </select>
      </div>

      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

      {loading ? (
        <div className={`${card} space-y-3 p-4`}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <Empty text={rows.length ? "No bookings match your filters." : "No bookings yet. They appear here the moment a client books."} />
      ) : (
        <div className={tableWrap}>
          <table className="w-full">
            <thead><tr>
              <th className={th}>Client</th>
              <th className={`${th} hidden lg:table-cell`}>Service</th>
              <th className={`${th} hidden sm:table-cell`}>Session</th>
              <th className={th}>Deposit</th>
              <th className={th}>Status</th>
              <th className={`${th} w-12`}><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, shown).map((b) => (
                <tr key={b.id} onClick={() => setOpenId(b.id)} className={`${trow} ${fresh.includes(b.id) ? "bg-amber-50" : ""}`}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Avatar name={b.full_name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{b.full_name}</p>
                        <p className="truncate font-mono text-xs text-slate-500">{b.reference ?? b.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} hidden lg:table-cell`}><p className="font-medium text-slate-800">{b.service}</p><p className="text-xs text-slate-500">{b.package_name}</p></td>
                  <td className={`${td} hidden sm:table-cell`}><p className="text-slate-800">{fmtDate(b.event_date)}</p><p className="text-xs text-slate-500">{fmtTime(b.event_time)}</p></td>
                  <td className={td}><Tag tone={payTone[b.payment_status]}>{b.payment_status === "paid" ? `Paid ${naira(b.deposit_amount)}` : b.payment_status}</Tag></td>
                  <td className={td}><Tag tone={statusTone[b.status]}>{b.status}</Tag></td>
                  <td className={td}><RowMenu items={menuFor(b)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>Showing {Math.min(shown, filtered.length)} of {filtered.length}</span>
            {filtered.length > shown && <button onClick={() => setShown((n) => n + PAGE)} className={btn}>Show more</button>}
          </div>
        </div>
      )}

      <Drawer open={!!open} onClose={() => setOpenId(null)} title="Booking details"
        footer={open && (
          <div className="space-y-2">
            {open.status === "pending" && <button disabled={busy} onClick={() => patch(open, { status: "confirmed" }, "Booking confirmed.")} className={`${btnDark} w-full`}>Confirm booking</button>}
            {open.status === "confirmed" && <button disabled={busy} onClick={() => patch(open, { status: "completed" }, "Marked as completed.")} className={`${btnDark} w-full`}>Mark as completed</button>}
            {open.status === "cancelled" && <button disabled={busy} onClick={() => patch(open, { status: "pending" }, "Booking reopened.")} className={`${btnDark} w-full`}>Reopen booking</button>}
            {open.payment_status !== "paid" && <button disabled={busy} onClick={() => patch(open, { payment_status: "paid" }, "Deposit marked as paid.")} className={`${open.status === "pending" ? btn : btnDark} w-full`}>Mark deposit as paid</button>}
            {open.payment_status === "paid" && <button disabled={busy} onClick={() => patch(open, { payment_status: "refunded" }, "Deposit marked as refunded.")} className={`${btn} w-full`}>Mark deposit as refunded</button>}
            {open.payment_status === "refunded" && <button disabled={busy} onClick={() => patch(open, { payment_status: "unpaid" }, "Deposit marked as unpaid.")} className={`${btn} w-full`}>Mark deposit as unpaid</button>}
            <div className="grid grid-cols-2 gap-2">
              <a href={waLink(open.phone, `Hello ${open.full_name.split(" ")[0]}, this is Danny Cyruz Photography about your booking ${open.reference ?? ""}.`)} target="_blank" rel="noreferrer" className={btn}>WhatsApp</a>
              <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Your booking ${open.reference ?? ""}`)}`} className={btn}>Email</a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {open.status !== "cancelled" && open.status !== "completed"
                ? <button disabled={busy} onClick={() => patch(open, { status: "cancelled" }, "Booking cancelled.")} className={btnDanger}>Cancel booking</button>
                : <span />}
              <button disabled={busy} onClick={() => setDelId(open.id)} className={btnDanger}>Delete</button>
            </div>
          </div>
        )}>
        {open && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar name={open.full_name} size={48} />
              <div>
                <p className="text-lg font-semibold text-slate-900">{open.full_name}</p>
                <p className="font-mono text-xs text-slate-500">{open.reference ?? "No reference"} · booked {fmtDate(open.created_at)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag tone={statusTone[open.status]}>{open.status}</Tag>
              <Tag tone={payTone[open.payment_status]}>Deposit {open.payment_status}</Tag>
            </div>

            <section className="rounded-xl bg-slate-50 p-4">
              <p className={`${label} mb-1`}>Client</p>
              <Row k="Email" v={<a className="text-indigo-600 underline" href={`mailto:${open.email}`}>{open.email}</a>} />
              <Row k="Phone" v={<a className="text-indigo-600 underline" href={`tel:${open.phone}`}>{open.phone}</a>} />
              <Row k="Instagram" v={open.instagram} />
            </section>

            <section className="rounded-xl bg-slate-50 p-4">
              <p className={`${label} mb-1`}>Session</p>
              <Row k="Service" v={open.service} />
              <Row k="Package" v={open.package_name} />
              <Row k="Date" v={fmtDate(open.event_date)} />
              <Row k="Time" v={fmtTime(open.event_time)} />
              <Row k="Type" v={open.session_type ? (open.session_type === "studio" ? "Inside the studio" : "Outdoor") : ""} />
              <Row k="Location" v={open.location} />
              <Row k="People" v={String(open.people)} />
            </section>

            {open.notes && (
              <section>
                <p className={`${label} mb-2`}>Notes from client</p>
                <p className="whitespace-pre-wrap rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800">{open.notes}</p>
              </section>
            )}

            <section className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-100">Money (NGN)</p>
              <div className="mt-2 flex justify-between text-sm"><span className="text-indigo-100">Package price</span><span className="font-semibold">{open.package_price != null ? naira(open.package_price) : "Quoted separately"}</span></div>
              <div className="mt-1 flex justify-between text-sm"><span className="text-indigo-100">Deposit ({open.payment_status})</span><span className="font-semibold">{naira(open.deposit_amount)}</span></div>
              {balance != null && <div className="mt-3 flex justify-between border-t border-white/25 pt-3"><span className="text-sm">Balance on the day</span><span className="text-xl font-bold">{naira(balance)}</span></div>}
            </section>
          </div>
        )}
      </Drawer>

      <ConfirmDialog open={!!toDelete} title="Delete this booking?" text={`This permanently removes ${toDelete?.reference ?? "the booking"} for ${toDelete?.full_name ?? "this client"}. To keep a record, cancel it instead.`} onCancel={() => setDelId(null)} onConfirm={() => toDelete && remove(toDelete)} />
      {toast}
    </div>
  );
}