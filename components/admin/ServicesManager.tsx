"use client";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import { uploadFile, removeFiles, slugify } from "@/lib/admin-utils";
import { services as siteServices } from "@/lib/content";
import { PageHead, Tag, Drawer, ConfirmDialog, Empty, Skeleton, Toggle, Icon, Field, FormSection, FileDrop, useToast, field, btn, btnDark, submitBtn, cancelBtn, card, tableWrap, th, td, trow, naira } from "./ui";

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

      {loading ? <div className={`${card} mt-6 space-y-3 p-4`}>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : rows.length > 0 ? (
        <div className={`${tableWrap} mt-6`}>
          <table className="w-full">
            <thead><tr>
              <th className={`${th} w-10`}>#</th>
              <th className={th}>Service</th>
              <th className={`${th} hidden sm:table-cell`}>From</th>
              <th className={`${th} hidden md:table-cell`}>Packages</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr></thead>
            <tbody>
              {rows.map((s, n) => (
                <tr key={s.id} onClick={() => openForm(s)} className={trow}>
                  <td className={`${td} text-xs text-slate-400`}>{n + 1}</td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{s.image_url && <img src={s.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />}</span>
                      <div className="min-w-0"><p className="truncate font-medium text-slate-900">{s.name}</p><p className="line-clamp-1 text-xs text-slate-500">{s.blurb}</p></div>
                    </div>
                  </td>
                  <td className={`${td} hidden font-medium sm:table-cell`}>{s.price_from != null ? naira(s.price_from) : "—"}</td>
                  <td className={`${td} hidden md:table-cell`}>{(s.extras ?? []).length}</td>
                  <td className={td}>
                    <button type="button" title={s.active ? "Click to hide from the site" : "Click to show on the site"} onClick={(e) => { e.stopPropagation(); void toggleActive(s); }}>
                      {s.active ? <Tag tone="green">Visible</Tag> : <Tag>Hidden</Tag>}
                    </button>
                  </td>
                  <td className={td}>
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => openForm(s)} aria-label={`Edit ${s.name}`} title="Edit" className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Icon name="edit" size={15} /><span className="hidden sm:inline">Edit</span></button>
                      <button type="button" onClick={() => setDel(s)} aria-label={`Delete ${s.name}`} title="Delete" className="flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white"><Icon name="trash" size={15} /><span className="hidden sm:inline">Delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">These are the services currently on your site. Import them to edit or delete them here.</p>
            <button disabled={busy} onClick={importCurrent} className={btnDark}>{busy ? "Importing…" : "Import to edit"}</button>
          </div>
          <div className={tableWrap}>
            <table className="w-full">
              <thead><tr>
                <th className={`${th} w-10`}>#</th>
                <th className={th}>Service</th>
                <th className={`${th} hidden sm:table-cell`}>From</th>
                <th className={`${th} hidden md:table-cell`}>Packages</th>
                <th className={th}>Status</th>
              </tr></thead>
              <tbody>
                {siteServices.map((s, n) => (
                  <tr key={s.slug} className="border-t border-slate-100">
                    <td className={`${td} text-xs text-slate-400`}>{n + 1}</td>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{s.image && <img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover" />}</span>
                        <div className="min-w-0"><p className="truncate font-medium text-slate-900">{s.name}</p><p className="line-clamp-1 text-xs text-slate-500">{s.blurb}</p></div>
                      </div>
                    </td>
                    <td className={`${td} hidden font-medium sm:table-cell`}>{naira(s.from)}</td>
                    <td className={`${td} hidden md:table-cell`}>{s.packages.length}</td>
                    <td className={td}><Tag tone="blue">On site</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer open={panel !== "closed"} onClose={() => !busy && setPanel("closed")} icon="layers"
        title={editing ? "Edit service" : "Add service"} subtitle={editing ? "Update what clients see on the Services page." : "Create a new service for your site."}
        footer={<div className="flex gap-3"><button form="sf" disabled={busy} className={submitBtn}>{busy ? "Saving…" : "Save service"}</button><button type="button" disabled={busy} onClick={() => setPanel("closed")} className={cancelBtn}>Cancel</button></div>}>
        <form id="sf" onSubmit={save} className="space-y-4">
          <FormSection title="Basics" desc="The name and description clients read.">
            <Field label="Name"><input className={field} value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="Weddings" /></Field>
            <Field label="Web name (slug)" optional hint="Used in the page link. Leave empty to create it from the name."><input className={field} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name) || "auto from name"} /></Field>
            <Field label="Description"><textarea className={field} rows={4} value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="A short, warm description of this service." /></Field>
          </FormSection>

          <FormSection title="Pricing & inclusions">
            <Field label="Starting price (₦)"><input className={field} type="number" min={0} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value === "" ? "" : Number(e.target.value))} placeholder="6500" /></Field>
            <Field label="What's included" optional hint="One item per line."><textarea className={field} rows={4} value={includes} onChange={(e) => setIncludes(e.target.value)} placeholder={"Edited photos\nOnline gallery"} /></Field>
          </FormSection>

          <FormSection title="Packages" desc="Different options clients can choose from.">
            {pkgs.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">No packages yet.</p>}
            <div className="space-y-3">
              {pkgs.map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Package {String(i + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => setPkgs((x) => x.filter((_, k) => k !== i))} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"><Icon name="trash" size={14} />Remove</button>
                  </div>
                  <div className="space-y-2">
                    <input className={field + " !mt-0 !bg-white"} placeholder="Package title" value={p.title} onChange={(e) => setPkg(i, { title: e.target.value })} />
                    <input className={field + " !mt-0 !bg-white"} type="number" min={0} placeholder="Price (₦)" value={p.price} onChange={(e) => setPkg(i, { price: e.target.value === "" ? "" : Number(e.target.value) })} />
                    <input className={field + " !mt-0 !bg-white"} placeholder="Short detail" value={p.detail} onChange={(e) => setPkg(i, { detail: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setPkgs((x) => [...x, { title: "", price: "", detail: "" }])} className={`${btn} w-full !rounded-xl !py-3 !text-sm`}><Icon name="plus" size={16} />Add package</button>
          </FormSection>

          <FormSection title="Image">
            <FileDrop files={image ? [image] : []} onChange={(f) => setImage(f[0] ?? null)} accept="image/jpeg,image/png,image/webp,image/avif"
              existingUrl={editing?.image_url} title={editing ? "Replace image" : "Upload an image"} hint="Click to browse or drag it here" />
          </FormSection>

          <FormSection title="Display">
            <Field label="Position" hint="Lowest number shows first."><input className={field} type="number" value={sort} onChange={(e) => setSort(e.target.value === "" ? "" : Number(e.target.value))} /></Field>
            <Toggle checked={active} onChange={setActive} text="Show on the site" hint="Turn off to hide it without deleting" />
          </FormSection>
        </form>
      </Drawer>

      <ConfirmDialog open={!!del} title="Delete this service?" text={`This permanently removes "${del?.name}". Use Hide to keep it without showing it.`} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
      {toast}
    </div>
  );
}