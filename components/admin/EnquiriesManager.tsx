"use client";
import { useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import type { Enquiry } from "@/lib/useRealtimeTable";
import { waLink } from "@/lib/admin-utils";
import { PageHead, Tag, Drawer, ConfirmDialog, Empty, Skeleton, Avatar, Icon, RowMenu, useToast, label, btn, btnDark, btnDanger, card, tableWrap, th, td, trow, fmtDate, timeAgo } from "./ui";

const tone = { new: "dark", replied: "green", closed: "grey" } as const;
const tabs = ["all", "new", "replied", "closed"] as const;

export default function EnquiriesManager() {
  const { rows, loading, error, reload } = useAdminTable<Enquiry>("enquiries", "created_at", false);
  const [toast, notify] = useToast();
  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => rows.filter((r) => tab === "all" || r.status === tab), [rows, tab]);
  const open = rows.find((r) => r.id === openId) ?? null;
  const toDelete = rows.find((r) => r.id === delId) ?? null;
  const count = (t: string) => (t === "all" ? rows.length : rows.filter((r) => r.status === t).length);

  async function setStatus(r: Enquiry, status: Enquiry["status"]) {
    setBusy(true);
    const { error: err } = await getBrowserSupabase().from("enquiries").update({ status }).eq("id", r.id);
    setBusy(false);
    if (err) return notify(err.message, true);
    notify(status === "new" ? "Marked as new." : `Marked as ${status}.`); await reload();
  }

  async function remove(r: Enquiry) {
    setDelId(null); setBusy(true);
    const { error: err } = await getBrowserSupabase().from("enquiries").delete().eq("id", r.id);
    setBusy(false);
    if (err) return notify(err.message, true);
    setOpenId(null); notify("Enquiry deleted."); await reload();
  }

  const menuFor = (r: Enquiry) => [
    { label: "Read message", icon: "eye", onClick: () => setOpenId(r.id) },
    { label: "Reply on WhatsApp", icon: "phone", href: waLink(r.phone, `Hello ${r.full_name.split(" ")[0]}, thank you for contacting Danny Cyruz Photography.`) },
    { label: "Mark replied", icon: "check", hidden: r.status === "replied", onClick: () => setStatus(r, "replied") },
    { label: "Close", icon: "x", hidden: r.status === "closed", onClick: () => setStatus(r, "closed") },
    { label: "Delete", icon: "trash", danger: true, onClick: () => setDelId(r.id) },
  ];

  return (
    <div className="space-y-6">
      <PageHead title="Enquiries" sub={`${count("new")} new · ${rows.length} total`} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${tab === t ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {t} <span className={tab === t ? "text-indigo-200" : "text-slate-400"}>{count(t)}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

      {loading ? <div className={`${card} space-y-3 p-4`}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        : list.length === 0 ? <Empty text="Nothing here." />
        : (
          <div className={tableWrap}>
            <table className="w-full">
              <thead><tr>
                <th className={th}>From</th>
                <th className={`${th} hidden lg:table-cell`}>Service</th>
                <th className={`${th} hidden md:table-cell`}>Message</th>
                <th className={`${th} hidden sm:table-cell`}>Received</th>
                <th className={th}>Status</th>
                <th className={`${th} w-12`}><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} onClick={() => setOpenId(r.id)} className={trow}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Avatar name={r.full_name} />
                        <div className="min-w-0"><p className={`truncate text-slate-900 ${r.status === "new" ? "font-bold" : "font-medium"}`}>{r.full_name}</p><p className="truncate text-xs text-slate-500">{r.email}</p></div>
                      </div>
                    </td>
                    <td className={`${td} hidden lg:table-cell`}>{r.service ?? "General"}</td>
                    <td className={`${td} hidden max-w-xs md:table-cell`}><p className="truncate text-slate-600">{r.message}</p></td>
                    <td className={`${td} hidden whitespace-nowrap text-slate-500 sm:table-cell`}>{timeAgo(r.created_at)}</td>
                    <td className={td}><Tag tone={tone[r.status]}>{r.status}</Tag></td>
                    <td className={td}><RowMenu items={menuFor(r)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Drawer open={!!open} onClose={() => setOpenId(null)} title="Enquiry"
        footer={open && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a href={waLink(open.phone, `Hello ${open.full_name.split(" ")[0]}, thank you for contacting Danny Cyruz Photography.`)} target="_blank" rel="noreferrer" className={btnDark}>WhatsApp</a>
              <a href={`mailto:${open.email}?subject=${encodeURIComponent("Your enquiry – Danny Cyruz")}`} className={btn}>Email</a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {open.status !== "replied" && <button disabled={busy} onClick={() => setStatus(open, "replied")} className={btn}>Mark replied</button>}
              {open.status !== "closed" && <button disabled={busy} onClick={() => setStatus(open, "closed")} className={btn}>Close</button>}
              {open.status !== "new" && <button disabled={busy} onClick={() => setStatus(open, "new")} className={btn}>Mark as new</button>}
              <button disabled={busy} onClick={() => setDelId(open.id)} className={btnDanger}>Delete</button>
            </div>
          </div>
        )}>
        {open && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={open.full_name} size={48} />
              <div><p className="text-lg font-semibold text-slate-900">{open.full_name}</p><p className="text-xs text-slate-500">{fmtDate(open.created_at)} · {timeAgo(open.created_at)}</p></div>
              <span className="ml-auto"><Tag tone={tone[open.status]}>{open.status}</Tag></span>
            </div>
            <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div><dt className={label}>Email</dt><dd className="mt-1"><a className="text-indigo-600 underline" href={`mailto:${open.email}`}>{open.email}</a></dd></div>
              <div><dt className={label}>Phone</dt><dd className="mt-1"><a className="text-indigo-600 underline" href={`tel:${open.phone}`}>{open.phone}</a></dd></div>
              <div><dt className={label}>Service</dt><dd className="mt-1">{open.service ?? "General"}</dd></div>
              <div><dt className={label}>Target date</dt><dd className="mt-1">{open.target_date ? fmtDate(open.target_date) : "Not given"}</dd></div>
            </dl>
            <div>
              <p className={label}>Message</p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm leading-relaxed text-slate-800">{open.message}</p>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog open={!!toDelete} title="Delete this enquiry?" text={`This permanently removes the message from ${toDelete?.full_name ?? "this person"}.`} onCancel={() => setDelId(null)} onConfirm={() => toDelete && remove(toDelete)} />
      {toast}
    </div>
  );
}