"use client";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import { uploadFile, removeFiles, slugify } from "@/lib/admin-utils";
import { services as siteServices } from "@/lib/content";
import { PageHead, Tag, Drawer, ConfirmDialog, Empty, Skeleton, Toggle, Icon, RowMenu, useToast, field, label, btn, btnDark, card, tableWrap, th, td, trow, naira } from "./ui";

type Pkg = { tag?: string; title: string; price: number | ""; detail: string };
type Service = {
  id: string; slug: string; name: string; blurb: string | null; image_url: string | null;
  price_from: number | null; includes: string[] | null; extras: Pkg[] | null; sort: number | null; active: boolean | null;
};

export default function ServicesManager() {
  const { rows, loading, error, reload } = useAdminTable<Service>("services", "sort");
  const [toast, notify] = useToast();
  const [panel, setPanel] = useState<"closed" | "add" | Service>("closed");
  const [del, setDel] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [blurb, setBlurb] = useState("");
  const [priceFrom, setPriceFrom] = useState<number | "">("");
  const [includes, setIncludes] = useState("");
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [sort, setSort] = useState<number | "">("");
  const [active, setActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const editing = typeof panel === "object" ? panel : null;

  function openForm(s?: Service) {
    setName(s?.name ?? ""); setSlug(s?.slug ?? ""); setBlurb(s?.blurb ?? ""); setPriceFrom(s?.price_from ?? "");
    setIncludes((s?.includes ?? []).join("\n")); setPkgs(s?.extras ?? []); setSort(s?.sort ?? ""); setActive(s?.active ?? true);
    setImage(null); setPanel(s ?? "add");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return notify("Name is required.", true);
    setBusy(true);
    try {
      const body = {
        name: name.trim(),
        slug: slugify(slug || name),
        blurb: blurb.trim() || null,
        price_from: priceFrom === "" ? null : priceFrom,
        includes: includes.split("\n").map((l) => l.trim()).filter(Boolean),
        extras: pkgs.filter((p) => p.title.trim()).map((p, i) => ({ tag: p.tag ?? `Package ${String(i + 1).padStart(2, "0")}`, title: p.title.trim(), price: Number(p.price) || 0, detail: p.detail.trim() })),
        sort: sort === "" ? (rows.length ? Math.max(...rows.map((r) => r.sort ?? 0)) + 1 : 1) : sort,
        active,
        ...(image ? { image_url: await uploadFile(image, "services") } : {}),
      };
      const supabase = getBrowserSupabase();
      const { error: err } = editing
        ? await supabase.from("services").update(body).eq("id", editing.id)
        : await supabase.from("services").insert(body);
      if (err) throw new Error(err.message.includes("duplicate") ? "Another service already uses that web name (slug)." : err.message);
      if (editing && image) await removeFiles([editing.image_url]);
      notify("Saved."); setPanel("closed"); await reload();
    } catch (err) { notify(err instanceof Error ? err.message : "Something went wrong.", true); }
    finally { setBusy(false); }
  }

  async function remove(s: Service) {
    setDel(null); setBusy(true);
    const { error: err } = await getBrowserSupabase().from("services").delete().eq("id", s.id);
    if (err) { setBusy(false); return notify(err.message, true); }
    await removeFiles([s.image_url]);
    setBusy(false); notify(`"${s.name}" deleted.`); await reload();
  }

  async function toggleActive(s: Service) {
    const { error: err } = await getBrowserSupabase().from("services").update({ active: !s.active }).eq("id", s.id);
    if (err) notify(err.message, true); else await reload();
  }

  // Copies the services currently written in lib/content.ts into the database, so you can edit them here.
  async function importCurrent() {
    setBusy(true);
    const { error: err } = await getBrowserSupabase().from("services").insert(siteServices.map((s, i) => ({
      slug: s.slug, name: s.name, blurb: s.blurb, image_url: s.image, price_from: s.from, includes: [],
      extras: s.packages.map((p) => ({ tag: p.tag, title: p.title, price: p.price, detail: p.detail })), sort: i + 1, active: true,
    })));
    setBusy(false);
    if (err) return notify(err.message, true);
    notify("Imported."); await reload();
  }

  const setPkg = (i: number, patch: Partial<Pkg>) => setPkgs((p) => p.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  return (
    <div>
      <PageHead title="Services" sub={`${rows.length} services · ${rows.filter((r) => r.active).length} active`}>
        <button onClick={() => openForm()} className={btnDark}><Icon name="plus" size={16} />Add service</button>
      </PageHead>
      {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}

      {loading ? <div className={`${card} mt-6 space-y-3 p-4`}>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : rows.length > 0 && (
        <div className={`${tableWrap} mt-6`}>
          <table className="w-full">
            <thead><tr>
              <th className={th}>Service</th>
              <th className={`${th} hidden sm:table-cell`}>From</th>
              <th className={`${th} hidden md:table-cell`}>Packages</th>
              <th className={th}>Status</th>
              <th className={`${th} w-12`}><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} onClick={() => openForm(s)} className={trow}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{s.image_url && <img src={s.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />}</span>
                      <div className="min-w-0"><p className="truncate font-medium text-slate-900">{s.name}</p><p className="line-clamp-1 text-xs text-slate-500">{s.blurb}</p></div>
                    </div>
                  </td>
                  <td className={`${td} hidden font-medium sm:table-cell`}>{s.price_from != null ? naira(s.price_from) : "—"}</td>
                  <td className={`${td} hidden md:table-cell`}>{(s.extras ?? []).length}</td>
                  <td className={td}>{s.active ? <Tag tone="green">Visible</Tag> : <Tag>Hidden</Tag>}</td>
                  <td className={td}><RowMenu items={[
                    { label: "Edit", icon: "edit", onClick: () => openForm(s) },
                    { label: s.active ? "Hide from site" : "Show on site", icon: "eye", onClick: () => toggleActive(s) },
                    { label: "Delete", icon: "trash", danger: true, onClick: () => setDel(s) },
                  ]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && rows.length === 0 && (
        <div className="mt-6"><Empty text="No services in the database yet."><button disabled={busy} onClick={importCurrent} className={btn}>Import the services from the site</button></Empty></div>
      )}

      <Drawer open={panel !== "closed"} onClose={() => !busy && setPanel("closed")} title={editing ? "Edit service" : "Add service"}
        footer={<div className="flex gap-2"><button form="sf" disabled={busy} className={`${btnDark} flex-1`}>{busy ? "Saving…" : "Save"}</button><button type="button" disabled={busy} onClick={() => setPanel("closed")} className={btn}>Cancel</button></div>}>
        <form id="sf" onSubmit={save} className="space-y-4">
          <label className="block"><span className={label}>Name</span><input className={field} value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} /></label>
          <label className="block"><span className={label}>Web name (slug)</span><input className={field} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name) || "auto from name"} /></label>
          <label className="block"><span className={label}>Description</span><textarea className={field} rows={4} value={blurb} onChange={(e) => setBlurb(e.target.value)} /></label>
          <label className="block"><span className={label}>Starting price (₦)</span><input className={field} type="number" min={0} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value === "" ? "" : Number(e.target.value))} /></label>
          <label className="block"><span className={label}>What's included (one per line)</span><textarea className={field} rows={4} value={includes} onChange={(e) => setIncludes(e.target.value)} /></label>

          <div>
            <p className={label}>Packages</p>
            <div className="mt-2 space-y-3">
              {pkgs.map((p, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <input className={field + " !mt-0"} placeholder="Package title" value={p.title} onChange={(e) => setPkg(i, { title: e.target.value })} />
                  <input className={field + " !mt-0"} type="number" min={0} placeholder="Price (₦)" value={p.price} onChange={(e) => setPkg(i, { price: e.target.value === "" ? "" : Number(e.target.value) })} />
                  <input className={field + " !mt-0"} placeholder="Short detail" value={p.detail} onChange={(e) => setPkg(i, { detail: e.target.value })} />
                  <button type="button" onClick={() => setPkgs((x) => x.filter((_, k) => k !== i))} className="text-xs font-semibold text-rose-600 hover:underline">Remove package</button>
                </div>
              ))}
              <button type="button" onClick={() => setPkgs((x) => [...x, { title: "", price: "", detail: "" }])} className={btn}>+ Add package</button>
            </div>
          </div>

          {editing?.image_url && <img src={editing.image_url} alt="" className="max-h-44 w-full bg-slate-100 object-contain rounded-lg" />}
          <label className="block"><span className={label}>{editing ? "Replace image (optional)" : "Image"}</span><input className={field} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setImage(e.target.files?.[0] ?? null)} /></label>
          <label className="block"><span className={label}>Position (lowest first)</span><input className={field} type="number" value={sort} onChange={(e) => setSort(e.target.value === "" ? "" : Number(e.target.value))} /></label>
          <Toggle checked={active} onChange={setActive} text="Show on the site" />
        </form>
      </Drawer>

      <ConfirmDialog open={!!del} title="Delete this service?" text={`This permanently removes "${del?.name}". Use Hide to keep it without showing it.`} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
      {toast}
    </div>
  );
}