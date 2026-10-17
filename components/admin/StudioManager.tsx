"use client";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import { uploadFile, removeFiles } from "@/lib/admin-utils";
import { PageHead, Drawer, ConfirmDialog, Empty, Skeleton, Icon, Field, FormSection, FileDrop, useToast, field, btn, btnDark, submitBtn, cancelBtn, card } from "./ui";

type Photo = { id: string; caption: string; image_url: string; sort: number; created_at: string };

export default function StudioManager() {
  const { rows, loading, error, reload } = useAdminTable<Photo>("studio_photos", "sort");
  const [toast, notify] = useToast();
  const [panel, setPanel] = useState<"closed" | "add" | Photo>("closed");
  const [del, setDel] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);

  const [caption, setCaption] = useState("");
  const [sort, setSort] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const editing = typeof panel === "object" ? panel : null;
  const nextSort = rows.length ? Math.max(...rows.map((r) => r.sort)) + 1 : 1;

  function openAdd() { setCaption(""); setSort(""); setFiles([]); setPanel("add"); }
  function openEdit(p: Photo) { setCaption(p.caption); setSort(p.sort); setFiles([]); setPanel(p); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    setBusy(true);
    try {
      if (editing) {
        const changes: Partial<Photo> = { caption: caption.trim(), sort: sort === "" ? editing.sort : sort };
        if (files[0]) changes.image_url = await uploadFile(files[0], "studio");
        const { error: err } = await supabase.from("studio_photos").update(changes).eq("id", editing.id);
        if (err) throw new Error(err.message);
        if (files[0]) await removeFiles([editing.image_url]);
        notify("Saved.");
      } else {
        if (!files.length) throw new Error("Choose at least one photo.");
        let n = sort === "" ? nextSort : sort;
        for (const f of files) {
          const image_url = await uploadFile(f, "studio");
          const { error: err } = await supabase.from("studio_photos").insert({ caption: caption.trim(), image_url, sort: n++ });
          if (err) throw new Error(err.message);
        }
        notify(files.length > 1 ? `${files.length} photos added. Live on the Studio page.` : "Added. Live on the Studio page.");
      }
      setPanel("closed"); await reload();
    } catch (err) { notify(err instanceof Error ? err.message : "Something went wrong.", true); }
    finally { setBusy(false); }
  }

  async function remove(p: Photo) {
    setDel(null); setBusy(true);
    const { error: err } = await getBrowserSupabase().from("studio_photos").delete().eq("id", p.id);
    if (err) { setBusy(false); return notify(err.message, true); }
    await removeFiles([p.image_url]);
    setBusy(false); notify("Photo deleted."); await reload();
  }

  // Swap with the neighbour, then renumber everything 1..n so positions never clash.
  async function move(p: Photo, dir: -1 | 1) {
    const order = [...rows].sort((a, b) => a.sort - b.sort || b.created_at.localeCompare(a.created_at));
    const from = order.findIndex((r) => r.id === p.id);
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    setBusy(true);
    const supabase = getBrowserSupabase();
    const results = await Promise.all(order.map((r, i) => (r.sort !== i + 1 ? supabase.from("studio_photos").update({ sort: i + 1 }).eq("id", r.id) : null)).filter(Boolean) as PromiseLike<{ error: { message: string } | null }>[]);
    setBusy(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) notify(failed.error.message, true);
    await reload();
  }

  const iconBtn = "flex h-9 w-9 items-center justify-center rounded-lg border bg-white disabled:opacity-40";
  return (
    <div>
      <PageHead title="Studio" sub={`${rows.length} photo${rows.length === 1 ? "" : "s"} · #1 is the big photo at the top of the Studio page`}>
        <button onClick={openAdd} className={btnDark}><Icon name="plus" size={16} />Add photos</button>
      </PageHead>
      {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {loading ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="aspect-[4/3] w-full" />)
          : rows.map((p, i) => (
            <article key={p.id} className={`${card} flex flex-col overflow-hidden`}>
              <div className="relative aspect-[4/3] bg-slate-100">
                <img src={p.image_url} alt={p.caption} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">#{i + 1}{i === 0 ? " · Top photo" : ""}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3">
                <p className={`min-h-[2.25rem] text-sm ${p.caption ? "font-medium text-slate-900" : "text-slate-400"}`}>{p.caption || "No caption"}</p>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => openEdit(p)} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"><Icon name="edit" size={15} />Edit</button>
                  <button type="button" onClick={() => setDel(p)} aria-label="Delete photo" title="Delete" className={`${iconBtn} border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white`}><Icon name="trash" size={16} /></button>
                  <button type="button" disabled={busy || i === 0} onClick={() => move(p, -1)} aria-label="Move earlier" title="Move earlier" className={`${iconBtn} border-slate-300 text-slate-600 hover:bg-slate-50`}><Icon name="left" size={16} /></button>
                  <button type="button" disabled={busy || i === rows.length - 1} onClick={() => move(p, 1)} aria-label="Move later" title="Move later" className={`${iconBtn} border-slate-300 text-slate-600 hover:bg-slate-50`}><Icon name="right" size={16} /></button>
                </div>
              </div>
            </article>
          ))}
      </div>
      {!loading && rows.length === 0 && (
        <div className="mt-6"><Empty text="No studio photos yet. Until you add some, the Studio page shows its built-in photos."><button onClick={openAdd} className={btn}>Add photos</button></Empty></div>
      )}

      <Drawer open={panel !== "closed"} onClose={() => !busy && setPanel("closed")} icon="camera"
        title={editing ? "Edit photo" : "Add studio photos"} subtitle={editing ? "Change the caption, order or replace the photo." : "Upload one or several photos for the Studio page."}
        footer={<div className="flex gap-3"><button form="stf" disabled={busy} className={submitBtn}>{busy ? "Saving…" : editing ? "Save changes" : files.length > 1 ? `Upload ${files.length} photos` : "Upload & publish"}</button><button type="button" disabled={busy} onClick={() => setPanel("closed")} className={cancelBtn}>Cancel</button></div>}>
        <form id="stf" onSubmit={save} className="space-y-4">
          <FormSection title={editing ? "Photo" : "Photos"} desc="JPG, PNG, WebP or AVIF.">
            <FileDrop files={files} onChange={setFiles} accept="image/jpeg,image/png,image/webp,image/avif" multiple={!editing}
              existingUrl={editing?.image_url} title={editing ? "Replace photo" : "Upload studio photos"} hint={editing ? "Click to browse or drag a new one here" : "Click to browse or drag them here · pick as many as you like"} />
          </FormSection>
          <FormSection title="Details">
            <Field label="Caption" optional hint={!editing && files.length > 1 ? "Used for all the photos you are uploading." : "Shown under the photo on the Studio page."}>
              <input className={field} value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={100} placeholder="Main daylight bay & white cyclorama" />
            </Field>
            <Field label="Position" hint="Lowest number shows first. #1 is the big photo at the top.">
              <input className={field} type="number" value={sort} onChange={(e) => setSort(e.target.value === "" ? "" : Number(e.target.value))} placeholder={editing ? String(editing.sort) : `${nextSort} (end of list)`} />
            </Field>
          </FormSection>
        </form>
      </Drawer>

      <ConfirmDialog open={!!del} title="Delete this photo?" text="This permanently removes it from the Studio page." onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
      {toast}
    </div>
  );
}