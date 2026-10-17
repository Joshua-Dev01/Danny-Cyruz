"use client";
import { useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import { uploadFile, removeFiles, parseYouTubeId } from "@/lib/admin-utils";
import { PageHead, Tag, Drawer, ConfirmDialog, Empty, Skeleton, Toggle, Icon, RowMenu, useToast, field, label, btn, btnDark, card } from "./ui";

type Item = {
  id: string; title: string; category: string; media_type: "photo" | "video";
  cover_url: string | null; video_url: string | null; youtube_id: string | null;
  vertical: boolean; featured: boolean; sort: number; created_at: string;
};

const thumb = (i: Item) => i.cover_url ?? (i.youtube_id ? `https://i.ytimg.com/vi/${i.youtube_id}/hqdefault.jpg` : null);

export default function PortfolioManager() {
  const { rows, loading, error, reload } = useAdminTable<Item>("portfolio_items", "sort");
  const [toast, notify] = useToast();
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [cat, setCat] = useState("all");
  const [panel, setPanel] = useState<"closed" | "add" | Item>("closed");
  const [del, setDel] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<number | "">("");
  const [featured, setFeatured] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [youtube, setYoutube] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [formType, setFormType] = useState<"photo" | "video">("photo");

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))), [rows]);
  const nextSort = rows.length ? Math.max(...rows.map((r) => r.sort)) + 1 : 1;
  const ofKind = rows.filter((r) => r.media_type === kind);
  const shown = ofKind.filter((r) => cat === "all" || r.category === cat);
  const editing = typeof panel === "object" ? panel : null;

  function openAdd() {
    setTitle(""); setCategory(cat !== "all" ? cat : ""); setSort(""); setFeatured(false); setVertical(false);
    setYoutube(""); setPhoto(null); setVideoFile(null); setPoster(null); setFormType(kind); setPanel("add");
  }
  function openEdit(i: Item) {
    setTitle(i.title); setCategory(i.category); setSort(i.sort); setFeatured(i.featured); setVertical(i.vertical);
    setYoutube(i.youtube_id ?? ""); setPhoto(null); setVideoFile(null); setPoster(null); setFormType(i.media_type); setPanel(i);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !category.trim()) return notify("Title and category are required.", true);
    const supabase = getBrowserSupabase();
    setBusy(true);
    try {
      if (editing) {
        const changes: Partial<Item> = { title: title.trim(), category: category.trim(), sort: sort === "" ? editing.sort : sort, featured };
        if (editing.media_type === "video") {
          changes.vertical = vertical;
          if (youtube.trim()) { const id = parseYouTubeId(youtube); if (!id) throw new Error("That doesn't look like a YouTube link."); changes.youtube_id = id; }
          if (poster) { changes.cover_url = await uploadFile(poster, "portfolio"); await removeFiles([editing.cover_url]); }
        } else if (photo) {
          changes.cover_url = await uploadFile(photo, "portfolio"); await removeFiles([editing.cover_url]);
        }
        const { error: err } = await supabase.from("portfolio_items").update(changes).eq("id", editing.id);
        if (err) throw new Error(err.message);
        notify("Saved.");
      } else {
        let youtubeId: string | null = null;
        if (formType === "photo") { if (!photo) throw new Error("Choose a photo to upload."); }
        else {
          youtubeId = parseYouTubeId(youtube);
          if (youtube.trim() && !youtubeId) throw new Error("That doesn't look like a YouTube link.");
          if (!videoFile && !youtubeId) throw new Error("Upload a video file or paste a YouTube link.");
        }
        const cover_url = formType === "photo" ? await uploadFile(photo!, "portfolio") : poster ? await uploadFile(poster, "portfolio") : null;
        const video_url = formType === "video" && videoFile ? await uploadFile(videoFile, "portfolio") : null;
        const { error: err } = await supabase.from("portfolio_items").insert({
          title: title.trim(), category: category.trim(), media_type: formType, cover_url, video_url, youtube_id: youtubeId,
          vertical: formType === "video" ? vertical : false, featured, sort: sort === "" ? nextSort : sort,
        });
        if (err) throw new Error(err.message);
        notify("Added. It is live on the site now.");
        setKind(formType);
      }
      setPanel("closed"); await reload();
    } catch (err) { notify(err instanceof Error ? err.message : "Something went wrong.", true); }
    finally { setBusy(false); }
  }

  async function remove(i: Item) {
    setDel(null); setBusy(true);
    const { error: err } = await getBrowserSupabase().from("portfolio_items").delete().eq("id", i.id);
    if (err) { setBusy(false); return notify(err.message, true); }
    await removeFiles([i.cover_url, i.video_url]);
    setBusy(false); notify(`"${i.title}" deleted.`); await reload();
  }

  // Swap with the neighbour, then renumber everything 1..n so positions never clash.
  async function move(i: Item, dir: -1 | 1) {
    const order = [...rows].sort((a, b) => a.sort - b.sort || a.created_at.localeCompare(b.created_at));
    const from = order.findIndex((r) => r.id === i.id);
    const sameKind = order.map((r, idx) => ({ r, idx })).filter((x) => x.r.media_type === i.media_type);
    const pos = sameKind.findIndex((x) => x.idx === from);
    const target = sameKind[pos + dir];
    if (!target) return;
    [order[from], order[target.idx]] = [order[target.idx], order[from]];
    setBusy(true);
    const supabase = getBrowserSupabase();
    const jobs = order.map((r, idx) => (r.sort !== idx + 1 ? supabase.from("portfolio_items").update({ sort: idx + 1 }).eq("id", r.id) : null)).filter(Boolean);
    const results = await Promise.all(jobs as PromiseLike<{ error: { message: string } | null }>[]);
    setBusy(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) notify(failed.error.message, true);
    await reload();
  }

  return (
    <div>
      <PageHead title="Portfolio" sub={`${rows.length} total · ${rows.filter((r) => r.media_type === "photo").length} photos · ${rows.filter((r) => r.media_type === "video").length} videos`}>
        <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white">
          {(["photo", "video"] as const).map((k) => (
            <button key={k} onClick={() => { setKind(k); setCat("all"); }} className={`px-4 py-2.5 text-xs font-semibold ${kind === k ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {k === "photo" ? "Photos" : "Videos"} ({rows.filter((r) => r.media_type === k).length})
            </button>
          ))}
        </div>
        <button onClick={openAdd} className={btnDark}><Icon name="plus" size={16} />Add new</button>
      </PageHead>

      <div className="mt-6 flex flex-wrap gap-2">
        {["all", ...Array.from(new Set(ofKind.map((r) => r.category)))].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${cat === c ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {c === "all" ? `All (${ofKind.length})` : `${c} (${ofKind.filter((r) => r.category === c).length})`}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {loading ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="aspect-[4/5] w-full" />)
          : shown.map((it) => (
            <article key={it.id} className={`${card} group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md`}>
              <div className="relative aspect-[4/5] bg-slate-100">
                {thumb(it) ? <img src={thumb(it)!} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs uppercase text-slate-400">{it.media_type}</span>}
                <div className="absolute left-2 top-2 flex gap-1.5">
                  {it.featured && <Tag tone="amber">★ Featured</Tag>}
                  {it.media_type === "video" && <Tag tone="violet">Video{it.vertical ? " · 9:16" : ""}</Tag>}
                </div>
                <span className="absolute bottom-2 left-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">#{it.sort}</span>
              </div>
              <div className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{it.title}</p>
                  <p className="truncate text-xs text-indigo-600">{it.category}</p>
                </div>
                <RowMenu items={[
                  { label: "Edit", icon: "edit", onClick: () => openEdit(it) },
                  { label: "Move earlier", icon: "left", onClick: () => move(it, -1) },
                  { label: "Move later", icon: "right", onClick: () => move(it, 1) },
                  { label: "Delete", icon: "trash", danger: true, onClick: () => setDel(it) },
                ]} />
              </div>
            </article>
          ))}
      </div>
      {!loading && shown.length === 0 && <div className="mt-6"><Empty text={`No ${kind === "photo" ? "photos" : "videos"} here yet.`}><button onClick={openAdd} className={btn}>Add one</button></Empty></div>}

      <Drawer open={panel !== "closed"} onClose={() => !busy && setPanel("closed")} title={editing ? "Edit item" : "Add to portfolio"}
        footer={<div className="flex gap-2"><button form="pf" disabled={busy} className={`${btnDark} flex-1`}>{busy ? "Saving…" : editing ? "Save changes" : "Upload & publish"}</button><button type="button" disabled={busy} onClick={() => setPanel("closed")} className={btn}>Cancel</button></div>}>
        <form id="pf" onSubmit={save} className="space-y-4">
          {!editing && (
            <div className="grid grid-cols-2 gap-2">
              {(["photo", "video"] as const).map((t) => (
                <button type="button" key={t} onClick={() => setFormType(t)} className={`rounded-lg border px-3 py-2.5 text-xs font-semibold capitalize ${formType === t ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-600"}`}>{t}</button>
              ))}
            </div>
          )}

          {editing?.cover_url && formType === "photo" && <img src={editing.cover_url} alt="" className="max-h-56 w-full object-contain bg-slate-100" />}

          <label className="block"><span className={label}>Title</span>
            <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required /></label>
          <label className="block"><span className={label}>Category</span>
            <input className={field} list="pf-cats" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Wedding, Portrait, Event…" maxLength={40} required />
            <datalist id="pf-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></label>

          {formType === "photo" ? (
            <label className="block"><span className={label}>{editing ? "Replace photo (optional)" : "Photo"}</span>
              <input className={field} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} /></label>
          ) : (
            <>
              <label className="block"><span className={label}>YouTube link</span>
                <input className={field} value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtu.be/…" /></label>
              {!editing && <label className="block"><span className={label}>Or upload a video (mp4, webm, mov · max 50 MB)</span>
                <input className={field} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} /></label>}
              <label className="block"><span className={label}>{editing ? "Replace poster image (optional)" : "Poster image (optional)"}</span>
                <input className={field} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setPoster(e.target.files?.[0] ?? null)} /></label>
              <Toggle checked={vertical} onChange={setVertical} text="Vertical (9:16) reel" />
            </>
          )}

          <label className="block"><span className={label}>Position (lowest shows first)</span>
            <input className={field} type="number" value={sort} onChange={(e) => setSort(e.target.value === "" ? "" : Number(e.target.value))} placeholder={editing ? String(editing.sort) : `${nextSort} (end of list)`} /></label>
          <Toggle checked={featured} onChange={setFeatured} text="Featured on the site" />
        </form>
      </Drawer>

      <ConfirmDialog open={!!del} title="Delete this item?" text={`This permanently removes "${del?.title}" from the public portfolio.`} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
      {toast}
    </div>
  );
}