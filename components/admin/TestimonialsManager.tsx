"use client";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import { PageHead, Tag, Drawer, ConfirmDialog, Empty, Skeleton, Toggle, Avatar, Icon, RowMenu, useToast, field, label, btn, btnDark, card, tableWrap, th, td, trow } from "./ui";

type T = { id: string; client_name: string; role: string | null; quote: string; published: boolean | null };

export default function TestimonialsManager() {
  const { rows, loading, error, reload } = useAdminTable<T>("testimonials");
  const [toast, notify] = useToast();
  const [panel, setPanel] = useState<"closed" | "add" | T>("closed");
  const [del, setDel] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [published, setPublished] = useState(true);
  const editing = typeof panel === "object" ? panel : null;

  function openForm(t?: T) {
    setName(t?.client_name ?? ""); setRole(t?.role ?? ""); setQuote(t?.quote ?? ""); setPublished(t?.published ?? true); setPanel(t ?? "add");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return notify("Name and quote are required.", true);
    setBusy(true);
    const body = { client_name: name.trim(), role: role.trim() || null, quote: quote.trim(), published };
    const supabase = getBrowserSupabase();
    const { error: err } = editing ? await supabase.from("testimonials").update(body).eq("id", editing.id) : await supabase.from("testimonials").insert(body);
    setBusy(false);
    if (err) return notify(err.message, true);
    notify("Saved."); setPanel("closed"); await reload();
  }

  async function remove(t: T) {
    setDel(null);
    const { error: err } = await getBrowserSupabase().from("testimonials").delete().eq("id", t.id);
    if (err) return notify(err.message, true);
    notify("Deleted."); await reload();
  }

  async function toggle(t: T) {
    const { error: err } = await getBrowserSupabase().from("testimonials").update({ published: !t.published }).eq("id", t.id);
    if (err) notify(err.message, true); else await reload();
  }

  return (
    <div>
      <PageHead title="Testimonials" sub={`${rows.length} total · ${rows.filter((r) => r.published).length} published`}>
        <button onClick={() => openForm()} className={btnDark}><Icon name="plus" size={16} />Add testimonial</button>
      </PageHead>
      {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}

      {loading ? <div className={`${card} mt-6 space-y-3 p-4`}>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : rows.length > 0 && (
        <div className={`${tableWrap} mt-6`}>
          <table className="w-full">
            <thead><tr>
              <th className={th}>Client</th>
              <th className={`${th} hidden md:table-cell`}>Quote</th>
              <th className={th}>Status</th>
              <th className={`${th} w-12`}><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} onClick={() => openForm(t)} className={trow}>
                  <td className={td}>
                    <div className="flex items-center gap-3"><Avatar name={t.client_name} /><div className="min-w-0"><p className="truncate font-medium text-slate-900">{t.client_name}</p><p className="truncate text-xs text-slate-500">{t.role}</p></div></div>
                  </td>
                  <td className={`${td} hidden max-w-md md:table-cell`}><p className="line-clamp-2 text-slate-600">“{t.quote}”</p></td>
                  <td className={td}>{t.published ? <Tag tone="green">Published</Tag> : <Tag>Hidden</Tag>}</td>
                  <td className={td}><RowMenu items={[
                    { label: "Edit", icon: "edit", onClick: () => openForm(t) },
                    { label: t.published ? "Hide" : "Publish", icon: "eye", onClick: () => toggle(t) },
                    { label: "Delete", icon: "trash", danger: true, onClick: () => setDel(t) },
                  ]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && rows.length === 0 && <div className="mt-6"><Empty text="No testimonials yet."><button onClick={() => openForm()} className={btn}>Add the first one</button></Empty></div>}

      <Drawer open={panel !== "closed"} onClose={() => !busy && setPanel("closed")} title={editing ? "Edit testimonial" : "Add testimonial"}
        footer={<div className="flex gap-2"><button form="tf" disabled={busy} className={`${btnDark} flex-1`}>{busy ? "Saving…" : "Save"}</button><button type="button" onClick={() => setPanel("closed")} className={btn}>Cancel</button></div>}>
        <form id="tf" onSubmit={save} className="space-y-4">
          <label className="block"><span className={label}>Client name</span><input className={field} value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} /></label>
          <label className="block"><span className={label}>Role (optional)</span><input className={field} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Wedding clients" maxLength={60} /></label>
          <label className="block"><span className={label}>Quote</span><textarea className={field} rows={5} value={quote} onChange={(e) => setQuote(e.target.value)} required maxLength={500} /></label>
          <Toggle checked={published} onChange={setPublished} text="Published" />
        </form>
      </Drawer>

      <ConfirmDialog open={!!del} title="Delete this testimonial?" text={`This permanently removes the quote from ${del?.client_name}.`} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
      {toast}
    </div>
  );
}