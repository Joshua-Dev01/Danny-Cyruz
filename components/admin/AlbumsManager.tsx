"use client";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAdminTable } from "@/lib/useAdminTable";
import { uploadFile, removeFiles, sha256, randomPasscode } from "@/lib/admin-utils";
import { PageHead, Tag, Drawer, ConfirmDialog, Empty, Skeleton, Toggle, Avatar, Icon, RowMenu, Field, FormSection, useToast, field, label, btn, btnDark, btnDanger, submitBtn, cancelBtn, card, tableWrap, th, td, trow, fmtDate } from "./ui";

type Photo = { url: string; name?: string };
type Album = {
  id: string; client_name: string; title: string; cover_url: string | null; passcode_hash: string;
  photos: Photo[] | null; favourites: string[] | null; allow_download: boolean | null; created_at: string;
};

export default function AlbumsManager() {
  const { rows, loading, error, reload } = useAdminTable<Album>("albums", "created_at", false);
  const [toast, notify] = useToast();
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [del, setDel] = useState<Album | null>(null);
  const [busy, setBusy] = useState(false);
  const [shownCode, setShownCode] = useState<{ who: string; code: string } | null>(null);

  const [client, setClient] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [download, setDownload] = useState(true);

  const open = rows.find((a) => a.id === openId) ?? null;
  const photos = open?.photos ?? [];
  const favs = new Set(open?.favourites ?? []);

  function openCreate() { setClient(""); setTitle(""); setCode(randomPasscode()); setDownload(true); setCreating(true); }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!client.trim() || !title.trim() || code.trim().length < 4) return notify("Client, title and a passcode of 4+ characters are required.", true);
    setBusy(true);
    const { data, error: err } = await getBrowserSupabase().from("albums")
      .insert({ client_name: client.trim(), title: title.trim(), passcode_hash: await sha256(code.trim().toUpperCase()), allow_download: download })
      .select("id").single();
    setBusy(false);
    if (err) return notify(err.message, true);
    setCreating(false); setShownCode({ who: client.trim(), code: code.trim().toUpperCase() });
    await reload(); setOpenId(data.id);
  }

  async function patch(a: Album, changes: Partial<Album>, done?: string) {
    const { error: err } = await getBrowserSupabase().from("albums").update(changes).eq("id", a.id);
    if (err) { notify(err.message, true); return false; }
    if (done) notify(done);
    await reload(); return true;
  }

  async function addPhotos(a: Album, files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const added: Photo[] = [];
      for (const f of Array.from(files)) added.push({ url: await uploadFile(f, `albums/${a.id}`), name: f.name });
      const all = [...(a.photos ?? []), ...added];
      await patch(a, { photos: all, cover_url: a.cover_url ?? added[0]?.url ?? null }, `${added.length} photo${added.length > 1 ? "s" : ""} added.`);
    } catch (err) { notify(err instanceof Error ? err.message : "Upload failed.", true); }
    setBusy(false);
  }

  async function removePhoto(a: Album, url: string) {
    const left = (a.photos ?? []).filter((p) => p.url !== url);
    await patch(a, { photos: left, favourites: (a.favourites ?? []).filter((u) => u !== url), cover_url: a.cover_url === url ? left[0]?.url ?? null : a.cover_url });
    await removeFiles([url]);
  }

  async function newPasscode(a: Album) {
    const c = randomPasscode();
    if (await patch(a, { passcode_hash: await sha256(c) })) setShownCode({ who: a.client_name, code: c });
  }

  async function remove(a: Album) {
    setDel(null); setBusy(true);
    const { error: err } = await getBrowserSupabase().from("albums").delete().eq("id", a.id);
    if (err) { setBusy(false); return notify(err.message, true); }
    await removeFiles((a.photos ?? []).map((p) => p.url));
    setBusy(false); setOpenId(null); notify("Album deleted."); await reload();
  }

  return (
    <div>
      <PageHead title="Client Albums" sub={`${rows.length} private galleries`}>
        <button onClick={openCreate} className={btnDark}><Icon name="plus" size={16} />New album</button>
      </PageHead>
      {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}

      {shownCode && (
        <div role="status" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm">Passcode for <strong>{shownCode.who}</strong>: <span className="font-mono text-base font-semibold tracking-widest">{shownCode.code}</span> <span className="text-slate-500">— copy it now, it can't be shown again.</span></p>
          <div className="flex gap-2">
            <button className={btn} onClick={() => { void navigator.clipboard.writeText(shownCode.code); notify("Copied."); }}>Copy</button>
            <button className={btn} onClick={() => setShownCode(null)}>Done</button>
          </div>
        </div>
      )}

      {loading ? <div className={`${card} mt-6 space-y-3 p-4`}>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : rows.length > 0 && (
        <div className={`${tableWrap} mt-6`}>
          <table className="w-full">
            <thead><tr>
              <th className={th}>Album</th>
              <th className={`${th} hidden md:table-cell`}>Client</th>
              <th className={th}>Photos</th>
              <th className={`${th} hidden sm:table-cell`}>Favourites</th>
              <th className={`${th} hidden lg:table-cell`}>Downloads</th>
              <th className={`${th} hidden lg:table-cell`}>Created</th>
              <th className={`${th} w-12`}><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} onClick={() => setOpenId(a.id)} className={trow}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{a.cover_url ? <img src={a.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-slate-400"><Icon name="image" /></span>}</span>
                      <p className="truncate font-medium text-slate-900">{a.title}</p>
                    </div>
                  </td>
                  <td className={`${td} hidden md:table-cell`}><div className="flex items-center gap-2"><Avatar name={a.client_name} size={26} />{a.client_name}</div></td>
                  <td className={td}><Tag tone="blue">{(a.photos ?? []).length}</Tag></td>
                  <td className={`${td} hidden sm:table-cell`}><Tag tone="amber">★ {(a.favourites ?? []).length}</Tag></td>
                  <td className={`${td} hidden lg:table-cell`}>{a.allow_download ? <Tag tone="green">On</Tag> : <Tag>Off</Tag>}</td>
                  <td className={`${td} hidden whitespace-nowrap text-slate-500 lg:table-cell`}>{fmtDate(a.created_at)}</td>
                  <td className={td}><RowMenu items={[
                    { label: "Open album", icon: "eye", onClick: () => setOpenId(a.id) },
                    { label: a.allow_download ? "Turn downloads off" : "Turn downloads on", icon: "download", onClick: () => patch(a, { allow_download: !a.allow_download }, "Updated.") },
                    { label: "New passcode", icon: "lock", onClick: () => newPasscode(a) },
                    { label: "Delete", icon: "trash", danger: true, onClick: () => setDel(a) },
                  ]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && rows.length === 0 && <div className="mt-6"><Empty text="No client albums yet."><button onClick={openCreate} className={btn}>Create the first album</button></Empty></div>}

      {/* New album */}
      <Drawer open={creating} onClose={() => !busy && setCreating(false)} icon="folder"
        title="New album" subtitle="A private gallery your client opens with a passcode."
        footer={<div className="flex gap-3"><button form="af" disabled={busy} className={submitBtn}>{busy ? "Creating…" : "Create album"}</button><button type="button" onClick={() => setCreating(false)} className={cancelBtn}>Cancel</button></div>}>
        <form id="af" onSubmit={create} className="space-y-4">
          <FormSection title="Album details">
            <Field label="Client name"><input className={field} value={client} onChange={(e) => setClient(e.target.value)} required maxLength={80} placeholder="Ada Okafor" /></Field>
            <Field label="Album title"><input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={80} placeholder="Wedding · 12 Oct" /></Field>
          </FormSection>
          <FormSection title="Client access" desc="Share this passcode with your client so they can open the album.">
            <Field label="Passcode">
              <div className="flex gap-2"><input className={field + " font-mono uppercase tracking-[0.3em]"} value={code} onChange={(e) => setCode(e.target.value)} required minLength={4} /><button type="button" onClick={() => setCode(randomPasscode())} className={`${btn} mt-1.5 !rounded-xl`}>New</button></div>
            </Field>
            <Toggle checked={download} onChange={setDownload} text="Client can download photos" hint="Turn off for view-only albums" />
          </FormSection>
        </form>
      </Drawer>

      {/* Album detail */}
      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open?.title ?? "Album"}
        footer={open && <button disabled={busy} onClick={() => setDel(open)} className={`${btnDanger} w-full`}>Delete album</button>}>
        {open && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium">{open.client_name}</p>
              <p className="text-xs text-slate-500">Created {fmtDate(open.created_at)}</p>
            </div>
            <Toggle checked={!!open.allow_download} onChange={(v) => patch(open, { allow_download: v })} text="Client can download photos" />
            <button disabled={busy} onClick={() => newPasscode(open)} className={`${btn} w-full`}>Generate a new passcode</button>

            <div>
              <label className={`${btnDark} inline-block cursor-pointer ${busy ? "opacity-50" : ""}`}>
                {busy ? "Uploading…" : "+ Upload photos"}
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} className="sr-only" onChange={(e) => { void addPhotos(open, e.target.files); e.target.value = ""; }} />
              </label>
            </div>

            {photos.length === 0 ? <p className="text-sm text-slate-500">No photos yet.</p> : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((p) => (
                  <div key={p.url} className="rounded-lg border border-slate-200">
                    <div className="relative aspect-[4/5] bg-slate-100">
                      <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                      {favs.has(p.url) && <span className="absolute left-1 top-1 bg-indigo-600 rounded px-1.5 py-0.5 text-[10px] text-white">★ Fav</span>}
                      {open.cover_url === p.url && <span className="absolute bottom-1 left-1 bg-white rounded px-1.5 py-0.5 text-[10px] shadow">Cover</span>}
                    </div>
                    <div className="flex justify-between gap-1 p-1.5 text-[10px] uppercase tracking-[0.1em]">
                      <button onClick={() => patch(open, { cover_url: p.url })} className="text-indigo-600 underline">Cover</button>
                      <button onClick={() => removePhoto(open, p.url)} className="text-rose-600 underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog open={!!del} title="Delete this album?" text={`This permanently removes "${del?.title}" and all of its photos.`} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
      {toast}
    </div>
  );
}